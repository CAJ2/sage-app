import type { Styles } from './styles'

export const defaultStyles: Styles = {
  control: {
    root: 'control flex flex-col',
    wrapper: 'wrapper flex',
    label: 'label pb-2',
    description: 'description min-h-6',
    input: 'input',
    error: 'error text-error min-h-6',
    textarea: 'text-area',
    select: 'select',
    option: 'option',
    asterisk: 'asterisk',
    required: 'required',
  },
  verticalLayout: {
    root: 'vertical-layout flex flex-col',
    item: 'vertical-layout-item flex-1 my-4',
  },
  horizontalLayout: {
    root: 'horizontal-layout flex flex-row',
    item: 'horizontal-layout-item flex-1',
  },
  group: {
    root: 'group',
    label: 'group-label label pb-2',
    item: 'group-item',
  },
  arrayList: {
    root: 'array-list flex flex-col content-center',
    legend: 'array-list-legend',
    addButton: 'array-list-add btn btn-sm btn-primary',
    label: 'array-list-label label mr-3',
    itemWrapper: 'array-list-item-wrapper',
    noData: 'array-list-no-data',
    item: 'array-list-item',
    itemToolbar:
      'array-list-item-toolbar flex items-center justify-end cursor-pointer',
    itemLabel: 'array-list-item-label flex-1 pl-1 h-6 leading-6',
    itemContent: 'array-list-item-content hidden py-0 px-4',
    itemExpanded: 'expanded',
    itemMoveUp: 'array-list-item-move-up btn btn-md btn-ghost',
    itemMoveDown: 'array-list-item-move-down btn btn-md btn-ghost',
    itemDelete: 'array-list-item-delete btn btn-md btn-ghost',
  },
  label: {
    root: 'label-element',
  },
  dialog: {
    root: 'dialog-root',
    title: 'dialog-title',
    body: 'dialog-body',
    actions: 'dialog-actions',
    buttonPrimary: 'dialog-button-primary',
    buttonSecondary: 'dialog-button-secondary',
  },
  oneOf: {
    root: 'one-of',
  },
  categorization: {
    root: 'categorization',
    category: 'categorization-category flex',
    selected: 'categorization-selected',
    panel: 'categorization-panel',
    stepper: 'categorization-stepper flex',
    stepperBadge: 'categorization-stepper-badge',
    stepperLine: 'categorization-stepper-line grow h-px border-0 border-b',
    stepperFooter: 'categorization-stepper-footer flex justify-end',
    stepperButtonBack: 'categorization-stepper-button-back',
    stepperButtonNext: 'categorization-stepper-button-next',
  },
}
