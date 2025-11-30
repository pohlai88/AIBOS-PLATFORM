/**
 * Workflow Components - Layer 3 Functional Components
 *
 * Built with dnd-kit, custom React patterns
 *
 * @module workflow
 * @layer 3
 * @library @dnd-kit/core, @dnd-kit/sortable
 */

export { Stepper } from "./stepper";
export type { StepperProps } from "./stepper";

export { Timeline, timelineVariants as workflowTimelineVariants } from "./timeline";
export type { TimelineProps } from "./timeline";

export { WizardFlow } from "./wizard-flow";
export type { WizardFlowProps } from "./wizard-flow";

export { KanbanBoard } from "./kanban-board";
export type { KanbanBoardProps } from "./kanban-board";

export { CommentThread } from "./comment-thread";
export type { CommentThreadProps } from "./comment-thread";

export { ChatUI } from "./chat-ui";
export type { ChatUIProps } from "./chat-ui";

export { AuditLogTimeline } from "./audit-log-timeline";
export type { AuditLogTimelineProps } from "./audit-log-timeline";

export { MultiStepForm } from "./multi-step-form";
export type { MultiStepFormProps } from "./multi-step-form";
