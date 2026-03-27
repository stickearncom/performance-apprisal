import { CheckCircle2, Layers3, Sparkles, Users } from 'lucide-react';

import { useAppraisalApp } from '@/app/useAppraisalApp';
import { Button } from '@/shared/ui';
import './StyleSheet.scss';

export function SetupView() {
  const { state, publishCycle, reassignAssignment, setActiveCycle } = useAppraisalApp();
  const activeCycle = state.cycles.find((cycle) => cycle.uuid === state.activeCycleUuid);
  const activeTemplate = state.templates.find((template) => template.uuid === activeCycle?.templateUuid);
  const cycleAssignments = state.assignments.filter((assignment) => assignment.cycleUuid === state.activeCycleUuid);
  const cycleExceptions = state.setupExceptions.filter((exception) => exception.cycleUuid === state.activeCycleUuid);

  return (
    <section className="setup-view">
      <div className="setup-view__column">
        <section className="setup-view__panel">
          <div className="setup-view__panel-header">
            <div>
              <p className="setup-view__eyebrow">Setup foundation</p>
              <h3 className="setup-view__panel-title">Competency library</h3>
            </div>
            <Sparkles className="setup-view__panel-icon" />
          </div>

          <div className="setup-view__card-list">
            {state.competencies.map((competency) => (
              <article key={competency.uuid} className="setup-view__item-card">
                <div className="setup-view__item-content">
                  <div>
                    <div className="setup-view__item-title">{competency.name}</div>
                    <div className="setup-view__item-copy">{competency.description}</div>
                  </div>
                  <span className="setup-view__item-pill">{competency.category.replace('_', ' ')}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="setup-view__panel">
          <div className="setup-view__panel-header">
            <div>
              <h3 className="setup-view__panel-title">Cycle control</h3>
              <p className="setup-view__panel-copy">Pilih draft cycle untuk dipublish atau lihat summary cycle aktif.</p>
            </div>
          </div>

          <div className="setup-view__card-list">
            {state.cycles.map((cycle) => (
              <button
                key={cycle.uuid}
                onClick={() => setActiveCycle(cycle.uuid)}
                className={`setup-view__cycle-card ${cycle.uuid === state.activeCycleUuid ? 'is-active' : ''}`}
              >
                <div className="setup-view__cycle-content">
                  <div>
                    <div className="setup-view__item-title">{cycle.name}</div>
                    <div className="setup-view__item-copy">{cycle.startDate} sampai {cycle.endDate}</div>
                  </div>
                  <span className={`setup-view__cycle-pill ${cycle.status === 'published' ? 'is-published' : 'is-draft'}`}>
                    {cycle.status}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="setup-view__action-row">
            <Button onClick={() => activeCycle && publishCycle(activeCycle.uuid)} disabled={activeCycle?.status === 'published'}>
              Publish active cycle
            </Button>
            <Button variant="outline">Preview template</Button>
          </div>
        </section>
      </div>

      <div className="setup-view__column">
        <section className="setup-view__panel">
          <div className="setup-view__panel-header">
            <div>
              <p className="setup-view__eyebrow">Template summary</p>
              <h3 className="setup-view__panel-title">{activeTemplate?.name}</h3>
            </div>
            <Layers3 className="setup-view__panel-icon" />
          </div>

          <div className="setup-view__template-grid">
            {activeTemplate?.sections.map((section) => (
              <article key={section.uuid} className="setup-view__summary-card">
                <div className="setup-view__summary-label">{section.name}</div>
                <div className="setup-view__summary-value">{section.weight}%</div>
              </article>
            ))}
          </div>
        </section>

        <section className="setup-view__panel">
          <div className="setup-view__panel-header">
            <div>
              <h3 className="setup-view__panel-title">Assignment summary</h3>
              <p className="setup-view__panel-copy">Snapshot assignment yang dibangkitkan untuk cycle aktif.</p>
            </div>
            <Users className="setup-view__panel-icon" />
          </div>

          <div className="setup-view__summary-grid">
            <article className="setup-view__summary-card">
              <div className="setup-view__summary-label">Self reviews</div>
              <div className="setup-view__summary-value">
                {cycleAssignments.filter((assignment) => assignment.assignmentType === 'self_review').length}
              </div>
            </article>
            <article className="setup-view__summary-card">
              <div className="setup-view__summary-label">Manager reviews</div>
              <div className="setup-view__summary-value">
                {cycleAssignments.filter((assignment) => assignment.assignmentType === 'manager_review').length}
              </div>
            </article>
            <article className="setup-view__summary-card">
              <div className="setup-view__summary-label">Exceptions</div>
              <div className="setup-view__summary-value">{cycleExceptions.length}</div>
            </article>
          </div>
        </section>

        <section className="setup-view__panel">
          <div className="setup-view__panel-header">
            <div>
              <h3 className="setup-view__panel-title">Mapping exceptions</h3>
              <p className="setup-view__panel-copy">Case yang masih butuh intervensi admin.</p>
            </div>
            <CheckCircle2 className="setup-view__panel-icon" />
          </div>

          <div className="setup-view__card-list">
            {cycleExceptions.length === 0 ? (
              <div className="setup-view__empty-state">
                Tidak ada exception. Cycle siap untuk dijalankan dengan mapping saat ini.
              </div>
            ) : (
              cycleExceptions.map((exception) => (
                <article key={exception.uuid} className="setup-view__exception-card">
                  <div className="setup-view__exception-content">
                    <div>
                      <div className="setup-view__item-title">{exception.employeeName}</div>
                      <div className="setup-view__item-copy">{exception.division} · missing manager mapping</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => reassignAssignment('asn_cyc_002_mgr_4', 'Temporary Manager')}>
                      Assign backup
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}