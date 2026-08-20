import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Icon from "../components/ui/Icon.jsx";
import PillIllustration from "../components/drugs/PillIllustration.jsx";
import DrugInfoTable from "../components/drugs/DrugInfoTable.jsx";
import SafetySection from "../components/drugs/SafetySection.jsx";
import { getDrugById } from "../data/mockData.js";

export default function DrugDetailPage() {
  const { drugId } = useParams();
  const drug = getDrugById(drugId);

  return (
    <div className="page page--drug-detail">
      <PageHeader
        eyebrow="의약품 상세"
        title={drug.name}
        description={`${drug.englishName} · 예시 데이터`}
        backTo="/search/results"
        action={<Badge tone="soft">공식정보 확인 전</Badge>}
      />
      <section className="drug-hero-card">
        <div className="drug-hero-card__visual">
          <span className="drug-hero-card__label">식별 이미지</span>
          <div className="drug-scene">
            <span className="drug-scene__grid" />
            <PillIllustration
              imprint={drug.imprintFront}
              size="large"
              variant={drug.imageVariant}
            />
            <PillIllustration
              imprint={drug.imprintBack}
              size="medium"
              variant={drug.imageVariant}
            />
          </div>
          <span className="drug-hero-card__caption">
            앞면 {drug.imprintFront} · 뒷면 {drug.imprintBack}
          </span>
        </div>
        <div className="drug-hero-card__summary">
          <Badge tone="blue">{drug.classification}</Badge>
          <p className="drug-hero-card__name">{drug.name}</p>
          <p>{drug.effect}</p>
          <div className="drug-hero-card__meta">
            <span>
              <Icon name="shield" size={15} /> 예시 데이터
            </span>
            <span>
              <Icon name="check" size={15} /> 정보 항목 확인
            </span>
          </div>
        </div>
      </section>
      <section className="detail-section" aria-labelledby="basic-info-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">한눈에 보기</span>
            <h2 id="basic-info-title">기본 정보</h2>
          </div>
          <Icon name="pill" size={22} />
        </div>
        <DrugInfoTable drug={drug} />
      </section>
      <section
        className="detail-section detail-section--soft"
        aria-labelledby="usage-title"
      >
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">공식 정보 연결 예정</span>
            <h2 id="usage-title">효능·사용 참고</h2>
          </div>
          <Icon name="notes" size={22} />
        </div>
        <p className="detail-copy">{drug.effect}</p>
        <p className="detail-copy detail-copy--muted">{drug.usage}</p>
      </section>
      <SafetySection drug={drug} />
      <p className="page-footnote">
        <Icon name="alert" size={15} /> 약품 정보는 참고용이며, 실제 복용 판단은
        의료진과 상담하세요.
      </p>
    </div>
  );
}
