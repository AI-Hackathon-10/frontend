import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Icon from "../components/ui/Icon.jsx";
import DoseConfirmModal from "../components/drugs/DoseConfirmModal.jsx";
import alertTriangle from "../assets/icons/triangle-alert.svg";
import { ApiError } from "../api/client.js";
import { markMedicationTaken } from "../api/medicationApi.js";
import { createReport, getReports } from "../api/reportApi.js";
import { createSymptomRecord } from "../api/symptomApi.js";
import {
  clearMedicationAnalysisResults,
  loadMedicationAnalysisSnapshot,
  normalizeMedicationResults,
} from "../utils/medicationAnalysisStorage.js";
import {
  clearReportCreationContext,
  loadReportCreationContext,
  saveReportCreationProgress,
} from "../utils/reportCreationStorage.js";

function toPercent(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;

  const percent = score <= 1 ? score * 100 : score;

  return Math.round(Math.min(100, Math.max(0, percent)));
}

function formatScore(value, suffix = "%") {
  const percent = toPercent(value);

  return percent === null ? "확인 불가" : `${percent}${suffix}`;
}

function isFailedResult(result) {
  return result.ok === false || (!result.itemName && !result.itemSeq);
}

function formatFailureMessage(message) {
  return message
    ? message.replace(/\.\s+/g, ".\n")
    : "사진이 흐리거나 식별 문자가 가려졌을 수 있어요.\n다른 사진으로 다시 시도해 주세요.";
}

function getRecommendationMeta(status) {
  if (status === "RECOMMENDED") {
    return {
      title: "현재 정보로는 복용을 고려할 수 있어요",
      tone: "recommended",
    };
  }

  if (status === "NOT_RECOMMENDED") {
    return {
      title: "지금은 이 약을 권장하지 않아요",
      tone: "not-recommended",
    };
  }

  return {
    title: "복용 전 확인이 필요해요",
    tone: "unknown",
  };
}

function splitItemName(itemName = "") {
  const match = itemName.match(/^(.+?)\s*\(([^()]+)\)\s*$/);

  return match
    ? {
        name: match[1],
        ingredient: match[2],
      }
    : {
        name: itemName,
        ingredient: null,
      };
}

function getInitialAnalysis(locationState) {
  const actualResults = normalizeMedicationResults(
    locationState?.results ?? locationState?.result,
  );

  if (actualResults.length) {
    return {
      analysisRunId: locationState?.analysisRunId ?? null,
      results: actualResults,
    };
  }

  return loadMedicationAnalysisSnapshot();
}

function ResultImage({ result, small = false }) {
  const [hasError, setHasError] = useState(false);

  const imageUrl = result.imageUrl || result.official?.imageUrl;

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return imageUrl && !hasError ? (
    <img
      alt={`${result.itemName} 알약`}
      className={small ? "result-candidate__image" : "analysis-card__image"}
      onError={() => setHasError(true)}
      src={imageUrl}
    />
  ) : (
    <div
      className={
        small
          ? "result-candidate__image result-image-fallback"
          : "analysis-card__image result-image-fallback"
      }
      aria-hidden="true"
    >
      <Icon name="search" size={small ? 20 : 32} />
    </div>
  );
}

function WarningModal({ open, result, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const sections = [
    ["경고", result.official?.warning],
    ["복용 전 주의", result.official?.caution],
    ["약물 상호작용", result.official?.interaction],
    ["부작용", result.official?.sideEffect],
  ].filter(([, content]) => content);

  return createPortal(
    <div
      className="dose-modal-backdrop warning-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="warning-modal-title"
        aria-modal="true"
        className="dose-modal warning-modal"
        role="dialog"
      >
        <button
          aria-label="주의사항 전체 보기 닫기"
          className="dose-modal__close icon-button"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={19} />
        </button>

        <div className="warning-modal__heading">
          <img alt="" src={alertTriangle} />

          <div>
            <span>안전 정보</span>
            <h2 id="warning-modal-title">주의사항 전체 보기</h2>
          </div>
        </div>

        <div className="warning-modal__sections">
          {sections.length ? (
            sections.map(([title, content]) => (
              <section key={title}>
                <h3>{title}</h3>
                <p>{content}</p>
              </section>
            ))
          ) : (
            <p className="warning-modal__empty">
              제공된 공식 주의사항이 없습니다.
            </p>
          )}

          {result.recommendation?.caution && (
            <section>
              <h3>AI 분석 주의사항</h3>
              <p>{result.recommendation.caution}</p>
            </section>
          )}

          {result.official?.storage && (
            <section>
              <h3>보관 방법</h3>
              <p>{result.official.storage}</p>
            </section>
          )}
        </div>

        <Button onClick={onClose} variant="outline">
          확인
        </Button>
      </section>
    </div>,
    document.body,
  );
}

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialAnalysis = useMemo(
    () => getInitialAnalysis(location.state),
    [location.state],
  );
  const { analysisRunId, results } = initialAnalysis;

  const rankedResults = useMemo(
    () =>
      results
        .map((result, originalIndex) => ({
          result,
          originalIndex,
        }))
        .sort(
          (a, b) =>
            (Number(b.result.recommendation?.score) || 0) -
            (Number(a.result.recommendation?.score) || 0),
        ),
    [results],
  );

  const aiTopIndex = rankedResults[0]?.originalIndex ?? 0;

  const [selectedIndex, setSelectedIndex] = useState(aiTopIndex);

  const [isWarningOpen, setWarningOpen] = useState(false);

  const [isDoseModalOpen, setDoseModalOpen] = useState(false);

  const [openDetails, setOpenDetails] = useState({
    efficacy: false,
    dosage: false,
  });

  const [isRecording, setIsRecording] = useState(false);

  const [doseError, setDoseError] = useState("");

  const selected = results[selectedIndex];

  const symptoms = location.state?.symptoms ?? [];

  useEffect(() => {
    setSelectedIndex(aiTopIndex);
  }, [aiTopIndex]);

  const handleSearchAgain = () => {
    clearMedicationAnalysisResults();
    clearReportCreationContext();
    navigate("/identify/image");
  };

  const handleConfirmDose = async () => {
    if (isRecording) return;

    setDoseError("");

    const context = loadReportCreationContext();
    const medicationId = context?.medicationIdsByResultIndex?.[selectedIndex];

    const contextMatchesResults = context
      && context.analysisRunId === analysisRunId
      && context.medicationIdsByResultIndex.length === results.length
      && selectedIndex >= 0
      && selectedIndex < results.length;

    if (!contextMatchesResults || !Number.isSafeInteger(medicationId) || medicationId <= 0) {
      setDoseError(
        "복용 기록 정보를 찾을 수 없습니다. 알약을 다시 분석해 주세요.",
      );
      return;
    }

    setIsRecording(true);

    try {
      const savedProgress = context.progressByResultIndex?.[selectedIndex];
      let symptomRecordId = savedProgress?.symptomRecordId;
      let intakeRecorded = savedProgress?.intakeRecorded ?? false;

      if (!symptomRecordId) {
        const symptomRecord = await createSymptomRecord({
          symptomTypes: context.symptomTypes,
          startedAt: context.startedAt,
          memo: context.memo,
        });
        symptomRecordId = symptomRecord?.symptomRecordId;

        if (!Number.isSafeInteger(symptomRecordId) || symptomRecordId <= 0) {
          throw new ApiError(
            "생성된 증상 기록 정보를 확인할 수 없습니다.",
            0,
            "INVALID_SYMPTOM_RECORD",
          );
        }

        saveReportCreationProgress({
          analysisRunId,
          resultIndex: selectedIndex,
          medicationId,
          symptomRecordId,
          intakeRecorded: false,
        });
      }

      if (!intakeRecorded) {
        await markMedicationTaken(medicationId);
        intakeRecorded = true;
        saveReportCreationProgress({
          analysisRunId,
          resultIndex: selectedIndex,
          medicationId,
          symptomRecordId,
          intakeRecorded,
        });
      }

      try {
        await createReport({ symptomRecordId, medicationId });
      } catch (reportError) {
        let existingReports = [];
        try {
          existingReports = (await getReports()) ?? [];
        } catch {
          // Preserve and surface the original report creation error.
        }

        const reportAlreadyExists = existingReports.some(
          (report) => report.symptomRecordId === symptomRecordId
            && report.medication?.medicationId === medicationId,
        );
        if (!reportAlreadyExists) throw reportError;
      }

      clearMedicationAnalysisResults();
      clearReportCreationContext();
      setDoseModalOpen(false);
      navigate("/symptoms");
    } catch (error) {
      setDoseError(
        error instanceof ApiError
          ? error.message
          : "복용 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsRecording(false);
    }
  };

  if (!selected) {
    return (
      <div className="page page--results page--narrow">
        <PageHeader
          eyebrow="알약 식별"
          title="판별 결과"
          backTo="/identify/image"
        />

        <section
          className="identify-result-state identify-result-state--error"
          role="alert"
        >
          <span className="identify-result-state__icon">
            <Icon name="alert" size={24} />
          </span>

          <h2>분석 결과를 불러올 수 없어요</h2>

          <p>저장된 분석 결과가 없습니다. 알약을 다시 분석해 주세요.</p>

          <button
            className="button button--outline"
            onClick={handleSearchAgain}
            type="button"
          >
            다시 찾기
          </button>
        </section>
      </div>
    );
  }

  const selectedFailed = isFailedResult(selected);

  const warningPreview =
    selected.recommendation?.caution ||
    selected.official?.warning ||
    selected.official?.caution;

  const recommendationMeta = getRecommendationMeta(
    selected.recommendation?.status,
  );

  const itemName = splitItemName(selected.itemName || "");

  const identificationPercent = toPercent(selected.identification?.score);

  const recommendationPercent = toPercent(selected.recommendation?.score);

  const isCautious =
    selectedFailed ||
    selected.recommendation?.status === "NOT_RECOMMENDED" ||
    (recommendationPercent !== null && recommendationPercent < 50);

  const handleDoseAction = () => {
    if (isRecording) return;

    setDoseError("");

    if (isCautious) {
      setDoseModalOpen(true);
      return;
    }

    handleConfirmDose();
  };

  return (
    <div className="page page--results page--narrow">
      <PageHeader
        eyebrow="알약 식별"
        title="이 약, 먹어도 될까요?"
        description="촬영한 약과 현재 증상을 함께 확인한 결과예요."
        backTo={null}
      />

      {selectedFailed ? (
        <article
          className="analysis-card analysis-card--failed"
          key={selectedIndex}
        >
          {symptoms.length > 0 && (
            <div className="analysis-card__context-row">
              <div
                className="results-symptom-list result-symptoms"
                aria-label="선택한 증상"
              >
                {symptoms.map((symptom) => (
                  <span className="result-symptom-chip" key={symptom}>
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          <section
            className="identify-result-state identify-result-state--error"
            role="alert"
          >
            <span className="identify-result-state__icon">
              <img alt="" src={alertTriangle} />
            </span>

            <h2>{selected.pillLabel || "알약"} - 판별 실패</h2>

            <p>{formatFailureMessage(selected.error)}</p>
          </section>
        </article>
      ) : (
        <article
          className={`analysis-card analysis-card--${recommendationMeta.tone}`}
          aria-labelledby="identified-drug-title"
          key={selectedIndex}
        >
          {(symptoms.length > 0 || selectedIndex === aiTopIndex) && (
            <div className="analysis-card__context-row">
              {symptoms.length > 0 && (
                <div
                  className="results-symptom-list result-symptoms"
                  aria-label="선택한 증상"
                >
                  {symptoms.map((symptom) => (
                    <span className="result-symptom-chip" key={symptom}>
                      {symptom}
                    </span>
                  ))}
                </div>
              )}

              {selectedIndex === aiTopIndex && (
                <span className="analysis-card__top-badge">
                  <Icon name="check" size={13} />
                  AI 추천 1순위
                </span>
              )}
            </div>
          )}

          <header className="analysis-card__hero">
            <div className="analysis-card__visual">
              <ResultImage result={selected} />
            </div>

            <div className="analysis-card__identity">
              <h2 id="identified-drug-title">{itemName.name}</h2>

              {itemName.ingredient && (
                <p className="analysis-card__ingredient">
                  {itemName.ingredient}
                </p>
              )}

              <div className="result-metrics" aria-label="핵심 분석 수치">
                <section className="result-metric">
                  <div>
                    <span>판별 일치도</span>

                    <strong>
                      {formatScore(selected.identification?.score)}
                    </strong>
                  </div>

                  <span className="result-metric__track" aria-hidden="true">
                    <span
                      style={{
                        width: `${identificationPercent ?? 0}%`,
                      }}
                    />
                  </span>
                </section>

                <section className="result-metric result-metric--recommendation">
                  <div>
                    <span>AI 추천 정도</span>

                    <strong>
                      {formatScore(selected.recommendation?.score)}
                    </strong>
                  </div>

                  <span className="result-metric__track" aria-hidden="true">
                    <span
                      style={{
                        width: `${recommendationPercent ?? 0}%`,
                      }}
                    />
                  </span>
                </section>
              </div>

              <section
                className="analysis-summary"
                aria-labelledby="recommendation-reason-title"
              >
                <h3 id="recommendation-reason-title">
                  {recommendationMeta.title}
                </h3>

                <p>
                  {selected.recommendation?.reason ||
                    "제공된 판단 이유가 없습니다."}
                </p>
              </section>
            </div>
          </header>

          {/* 주요 효능 / 복용 방법 영역
              위쪽으로 당기고,
              안전 정보와의 간격은 넓게 유지 */}
          <section
            className="result-details"
            aria-label="약 상세 정보"
            style={{
              marginTop: "-16px",
              marginBottom: "24px",
            }}
          >
            <div className="result-details__items">
              <details open={openDetails.efficacy}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();

                    setOpenDetails((current) => ({
                      ...current,
                      efficacy: !current.efficacy,
                    }));
                  }}
                >
                  <span>
                    <Icon
                      className="result-detail-icon"
                      name="check"
                      size={18}
                    />
                    주요 효능
                  </span>

                  <Icon
                    className="result-chevron-icon"
                    name="chevronDown"
                    size={18}
                  />
                </summary>

                <p>{selected.official?.efficacy || "공식 정보가 없습니다."}</p>
              </details>

              <details open={openDetails.dosage}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();

                    setOpenDetails((current) => ({
                      ...current,
                      dosage: !current.dosage,
                    }));
                  }}
                >
                  <span>
                    <Icon
                      className="result-detail-icon"
                      name="notes"
                      size={18}
                    />
                    복용 방법
                  </span>

                  <Icon
                    className="result-chevron-icon"
                    name="chevronDown"
                    size={18}
                  />
                </summary>

                <p>{selected.official?.useMethod || "공식 정보가 없습니다."}</p>
              </details>
            </div>
          </section>

          <section className="analysis-card__warning">
            <img
              alt=""
              className="analysis-card__warning-icon"
              src={alertTriangle}
            />

            <div>
              <span>안전 정보</span>

              <h3>복용 전 꼭 확인하세요</h3>

              <p>{warningPreview || "제공된 주의사항이 없습니다."}</p>

              <button onClick={() => setWarningOpen(true)} type="button">
                주의사항 전체 보기
                <Icon
                  className="result-link-icon"
                  name="arrowRight"
                  size={13}
                />
              </button>
            </div>
          </section>
        </article>
      )}

      {results.length > 1 && (
        <section
          className="result-candidates"
          aria-labelledby="candidate-title"
        >
          <div className="result-candidates__heading">
            <div>
              <h2 id="candidate-title">전체 분석 결과</h2>
              <p>각 알약의 판별 결과를 확인해 보세요.</p>
            </div>

            <span>{results.length}개 결과</span>
          </div>

          <div className="result-candidates__scroller">
            {rankedResults.map(({ result, originalIndex }) => {
              const failed = isFailedResult(result);

              return (
                <button
                  aria-label={`${
                    result.itemName || result.pillLabel || "알약"
                  } 결과 보기`}
                  aria-pressed={selectedIndex === originalIndex}
                  className={`result-candidate${
                    failed ? " result-candidate--failed" : ""
                  }`}
                  disabled={isRecording}
                  key={`${
                    result.itemSeq || result.itemName || result.pillLabel
                  }-${originalIndex}`}
                  onClick={() => {
                    setSelectedIndex(originalIndex);

                    setWarningOpen(false);
                    setDoseError("");

                    setOpenDetails({
                      efficacy: false,
                      dosage: false,
                    });
                  }}
                  type="button"
                >
                  <div className="result-candidate__visual">
                    {failed ? (
                      <div
                        className="result-candidate__image result-image-fallback"
                        aria-hidden="true"
                      >
                        <Icon name="alert" size={20} />
                      </div>
                    ) : (
                      <ResultImage result={result} small />
                    )}

                    {originalIndex === aiTopIndex && !failed && (
                      <span className="result-candidate__top">AI 1순위</span>
                    )}

                    {selectedIndex === originalIndex && (
                      <span className="result-candidate__selected">
                        <Icon name="check" size={12} />
                      </span>
                    )}
                  </div>

                  <div className="result-candidate__copy">
                    <strong>
                      {failed
                        ? `${result.pillLabel || "알약"} (판별 실패)`
                        : result.itemName}
                    </strong>

                    {failed ? (
                      <span className="result-candidate__metric">
                        식별 불가
                      </span>
                    ) : (
                      <>
                        <span className="result-candidate__metric">
                          일치도{" "}
                          <b>{formatScore(result.identification?.score)}</b>
                        </span>

                        <span className="result-candidate__metric">
                          AI 추천{" "}
                          <b>{formatScore(result.recommendation?.score)}</b>
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div
        className={`results-actions ${
          isCautious ? "results-actions--cautious" : ""
        }`}
      >
        <Button
          className="button--grow"
          disabled={isRecording}
          icon="arrowLeft"
          onClick={handleSearchAgain}
          variant="outline"
        >
          다시 찾기
        </Button>

        {!selectedFailed && (
          <Button
            className="button--grow results-dose-action"
            disabled={isRecording}
            icon="check"
            onClick={handleDoseAction}
            variant="primary"
          >
            {isRecording ? "복용 기록 중..." : "복용하기"}
          </Button>
        )}
      </div>

      {doseError && !isDoseModalOpen ? (
        <p className="page-footnote page-footnote--error" role="alert">
          {doseError}
        </p>
      ) : null}

      <p className="page-footnote">
        <Icon name="shield" size={15} />
        AI 분석 결과는 참고용입니다. 복용 전 의사·약사와 확인하세요.
      </p>

      <WarningModal
        onClose={() => setWarningOpen(false)}
        open={isWarningOpen}
        result={selected}
      />

      <DoseConfirmModal
        analysisWarning={isCautious}
        errorMessage={doseError}
        isSubmitting={isRecording}
        onCancel={() => {
          if (!isRecording) {
            setDoseModalOpen(false);
            setDoseError("");
          }
        }}
        onConfirm={handleConfirmDose}
        open={isDoseModalOpen}
      />
    </div>
  );
}
