import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader.jsx";
import Icon from "../components/ui/Icon.jsx";
import Button from "../components/ui/Button.jsx";
import SymptomSelector from "../components/drugs/SymptomSelector.jsx";
import UploadCard from "../components/drugs/UploadCard.jsx";
import { PRIMARY_SYMPTOMS, SYMPTOM_CATEGORIES } from "../data/mockData.js";
import {
  findUnsupportedMedicationSymptoms,
  toMedicationSymptomTypes,
} from "../data/medicationSymptoms.js";
import {
  getPresignedUrl,
  identifyMedication,
  uploadMedicationImage,
} from "../api/medicationApi.js";
import { ApiError } from "../api/client.js";
import {
  clearMedicationAnalysisResults,
  createMedicationAnalysisRunId,
  saveMedicationAnalysisResults,
} from "../utils/medicationAnalysisStorage.js";
import {
  buildMedicationIdsByResultIndex,
  clearReportCreationContext,
  saveReportCreationContext,
} from "../utils/reportCreationStorage.js";

export function getRelativeStartedAt(hoursAgo, now = Date.now()) {
  return new Date(now - Number(hoursAgo) * 60 * 60 * 1000).toISOString();
}

function getCurrentDateTimeInputValues(now = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

export default function ImageIdentifyPage() {
  const navigate = useNavigate();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [onsetInputMode, setOnsetInputMode] = useState("relative");
  const [isManualPickerOpen, setIsManualPickerOpen] = useState(false);
  const [onsetHoursAgo, setOnsetHoursAgo] = useState(0);
  const [onsetDate, setOnsetDate] = useState("");
  const [onsetTime, setOnsetTime] = useState("");
  const [memo, setMemo] = useState("");

  const nextPillSetId = useRef(2);

  const [pillSets, setPillSets] = useState([
    {
      id: 1,
      front: null,
      back: null,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((current) => {
      if (current.includes(symptom)) {
        return current.filter((item) => item !== symptom);
      }

      return current.length < 10 ? [...current, symptom] : current;
    });
  };

  const handleUploadChange = (setId, side, file) => {
    setPillSets((current) =>
      current.map((pillSet) =>
        pillSet.id === setId
          ? {
              ...pillSet,
              [side]: file,
            }
          : pillSet,
      ),
    );
  };

  const handleAddPillSet = () => {
    const id = nextPillSetId.current;

    nextPillSetId.current += 1;

    setPillSets((current) => [
      ...current,
      {
        id,
        front: null,
        back: null,
      },
    ]);
  };

  const handleRemovePillSet = (setId) => {
    setPillSets((current) => current.filter((pillSet) => pillSet.id !== setId));
  };

  async function uploadOnePillSet(pillSet, index, startedAt, symptomTypes) {
    const pillLabel = `알약 ${index + 1}`;
    let medicationId = null;

    try {
      const uploadContext =
        await getPresignedUrl();
      ({ medicationId } = uploadContext);
      const { requestId, frontUploadUrl, backUploadUrl } = uploadContext;

      await Promise.all([
        uploadMedicationImage(frontUploadUrl, pillSet.front),
        uploadMedicationImage(backUploadUrl, pillSet.back),
      ]);

      const result = await identifyMedication({
        requestId,
        symptomTypes,
        startedAt,
      });

      const items = Array.isArray(result) ? result : [result];

      console.log(`[DEBUG] ${pillLabel} API 응답:`, JSON.stringify(result));

      return {
        medicationId,
        results: items.map((item) => ({
          ...item,
          pillLabel,
        })),
      };
    } catch (e) {
      console.error(`[DEBUG] ${pillLabel} API 에러:`, e);

      return {
        medicationId,
        results: [
          {
            ok: false,
            pillLabel,
            itemName: null,
            error:
              e instanceof ApiError ? e.message : "분석 중 오류가 발생했습니다.",
          },
        ],
      };
    }
  }

  const handleFindPill = async () => {
    if (selectedSymptoms.length === 0) {
      return;
    }

    if (onsetInputMode === "manual" && (!onsetDate || !onsetTime)) {
      setErrorMessage("증상 발현 날짜와 시간을 선택해 주세요.");
      return;
    }

    if (onsetInputMode === "relative" && onsetHoursAgo < 0) {
      setErrorMessage("증상 발현 시간은 0시간 이상 입력해 주세요.");
      return;
    }

    const unsupportedSymptoms =
      findUnsupportedMedicationSymptoms(selectedSymptoms);

    if (unsupportedSymptoms.length > 0) {
      setErrorMessage(
        `현재 분석 API에서 지원하지 않는 증상입니다: ${unsupportedSymptoms.join(
          ", ",
        )}`,
      );
      return;
    }

    const readySets = pillSets.filter(
      (pillSet) => pillSet.front && pillSet.back,
    );

    if (readySets.length === 0) {
      setErrorMessage("앞면과 뒷면 사진을 모두 추가해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    clearMedicationAnalysisResults();
    clearReportCreationContext();

    try {
      const startedAt =
        onsetInputMode === "relative"
          ? getRelativeStartedAt(onsetHoursAgo)
          : new Date(`${onsetDate}T${onsetTime}`).toISOString();
      const symptomTypes = toMedicationSymptomTypes(selectedSymptoms);
      const analysisRunId = createMedicationAnalysisRunId();

      const resultGroups = await Promise.all(
        readySets.map((pillSet, index) =>
          uploadOnePillSet(pillSet, index, startedAt, symptomTypes),
        ),
      );

      const analysisResults = saveMedicationAnalysisResults(
        resultGroups.flatMap((group) => group.results),
        { analysisRunId },
      );

      if (analysisResults.length === 0) {
        throw new ApiError(
          "분석 결과를 찾을 수 없습니다. 사진을 다시 확인해 주세요.",
          0,
          "EMPTY_ANALYSIS_RESULT",
        );
      }

      saveReportCreationContext({
        analysisRunId,
        medicationIdsByResultIndex:
          buildMedicationIdsByResultIndex(resultGroups),
        symptomTypes,
        startedAt,
        memo,
      });

      navigate("/search/results", {
        state: {
          analysisRunId,
          symptoms: selectedSymptoms,
          results: analysisResults,
          memo,
          startedAt,
        },
      });
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "분석 중 오류가 발생했어요. 다시 시도해 주세요.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow page--identify">
      <PageHeader
        backTo={null}
        eyebrow="알약 식별"
        title="사진으로 알약 정보 찾기"
        description="증상을 선택하고 알약의 앞·뒷면 사진을 추가해 주세요."
      />

      <SymptomSelector
        categories={SYMPTOM_CATEGORIES}
        primarySymptoms={PRIMARY_SYMPTOMS}
        selected={selectedSymptoms}
        onToggle={handleToggleSymptom}
        maxSelected={10}
        required
      />

      <section
        aria-labelledby="symptom-onset-title"
        className="identify-context-section"
      >
        <div className="section-heading section-heading--tight">
          <div>
            <h2 id="symptom-onset-title">
              증상 발현 시간{" "}
              <span aria-hidden="true" className="required-mark">
                *
              </span>
              <span className="sr-only"> (필수)</span>
            </h2>
          </div>
        </div>

        <p className="section-helper">
          증상이 시작된 시간을 간편하게 선택해 주세요.
        </p>

        <div className="onset-control">
          <div className="onset-mode-slot">
            {!isManualPickerOpen ? (
              <div className="onset-relative-mode">
                <label className="onset-relative-input">
                  {onsetHoursAgo > 0 && <span>약</span>}

                  <input
                    aria-label="증상 시작 몇 시간 전"
                    aria-required="true"
                    className={onsetHoursAgo === 0 ? "is-now" : ""}
                    inputMode="numeric"
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "") {
                        setOnsetHoursAgo(0);
                      } else if (/^\d+$/.test(value)) {
                        setOnsetHoursAgo(Number(value));
                      }
                    }}
                    onFocus={(event) => event.target.select()}
                    pattern="[0-9]*"
                    required
                    type="text"
                    value={onsetHoursAgo === 0 ? "지금" : onsetHoursAgo}
                  />

                  {onsetHoursAgo > 0 && <span>시간 전</span>}
                </label>

                <div
                  aria-label="빠른 시간 선택"
                  className="onset-quick-options"
                  role="group"
                >
                  {[0, 1, 3, 6, 12].map((hours) => (
                    <button
                      aria-pressed={onsetHoursAgo === hours}
                      className={onsetHoursAgo === hours ? "is-selected" : ""}
                      key={hours}
                      onClick={() => setOnsetHoursAgo(hours)}
                      type="button"
                    >
                      {hours === 0 ? "지금" : `${hours}시간 전`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="onset-fields" id="manual-onset-fields">
                <label className="onset-field">
                  <span>날짜</span>

                  <input
                    aria-label="증상 시작 날짜"
                    aria-required="true"
                    onChange={(event) => setOnsetDate(event.target.value)}
                    required
                    type="date"
                    value={onsetDate}
                  />
                </label>

                <label className="onset-field">
                  <span>시간</span>

                  <input
                    aria-label="증상 시작 시간"
                    aria-required="true"
                    onChange={(event) => setOnsetTime(event.target.value)}
                    required
                    step="3600"
                    type="time"
                    value={onsetTime}
                  />
                </label>
              </div>
            )}
          </div>

          <button
            aria-expanded={isManualPickerOpen}
            aria-controls="manual-onset-fields"
            className="onset-manual-toggle"
            onClick={() => {
              if (!isManualPickerOpen && (!onsetDate || !onsetTime)) {
                const currentDateTime = getCurrentDateTimeInputValues();

                setOnsetDate(currentDateTime.date);
                setOnsetTime(currentDateTime.time);
              }

              setIsManualPickerOpen(!isManualPickerOpen);

              setOnsetInputMode(isManualPickerOpen ? "relative" : "manual");
            }}
            type="button"
          >
            <Icon name="clock" size={14} />

            {isManualPickerOpen
              ? "몇 시간 전으로 선택"
              : "날짜·시간으로 직접 선택"}

            <Icon name="chevronRight" size={13} />
          </button>
        </div>
      </section>

      <section
        aria-labelledby="captured-title"
        className="capture-section identify-upload-section"
      >
        <div className="section-heading section-heading--tight">
          <div>
            <h2 id="captured-title">
              알약 사진{" "}
              <span aria-hidden="true" className="required-mark">
                *
              </span>
              <span className="sr-only"> (필수)</span>
            </h2>
          </div>
        </div>

        <p className="section-helper">
          각인과 분할선이 선명한 사진일수록 식별에 도움이 됩니다.
        </p>

        <div className="pill-set-list">
          {pillSets.map((pillSet, index) => (
            <section
              aria-labelledby={`pill-set-${pillSet.id}-title`}
              className="pill-set"
              key={pillSet.id}
            >
              <div className="pill-set__header">
                <h3 id={`pill-set-${pillSet.id}-title`}>알약 {index + 1}</h3>

                {index > 0 && (
                  <button
                    aria-label={`알약 ${index + 1} 삭제`}
                    onClick={() => handleRemovePillSet(pillSet.id)}
                    type="button"
                  >
                    <Icon name="close" size={14} /> 삭제
                  </button>
                )}
              </div>

              <div className="upload-grid">
                <UploadCard
                  label="앞면"
                  required
                  side={`pill-${pillSet.id}-front`}
                  onChange={(file) =>
                    handleUploadChange(pillSet.id, "front", file)
                  }
                />

                <UploadCard
                  label="뒷면"
                  required
                  side={`pill-${pillSet.id}-back`}
                  onChange={(file) =>
                    handleUploadChange(pillSet.id, "back", file)
                  }
                />
              </div>
            </section>
          ))}
        </div>

        <button
          className="pill-set-add"
          onClick={handleAddPillSet}
          type="button"
        >
          <Icon name="plus" size={15} /> 알약 추가
        </button>
      </section>

      {errorMessage && (
        <p className="page-footnote page-footnote--error">{errorMessage}</p>
      )}

      <div className="identify-action-bar">
        <Button
          disabled={selectedSymptoms.length === 0 || isSubmitting}
          icon="search"
          onClick={handleFindPill}
          variant="primary"
        >
          {isSubmitting ? "분석 중..." : "알약 찾기"}
        </Button>
      </div>

      <div className="identify-footnotes">
        <p className="page-footnote">
          <Icon name="shield" size={15} /> AI 판별 결과는 참고용이며, 사진은
          판별 목적으로만 안전하게 처리됩니다.
        </p>
      </div>
    </div>
  );
}
