import UIButton from './ui-button/UIButton.vue'
import UIButtonGroup from './ui-button-group/UIButtonGroup.vue'
import UIChart from './ui-chart/UIChart.vue'
import UIControl from './ui-control/UIControl.vue'
import UIDropdown from './ui-dropdown/UIDropdown.vue'
import UIEvent from './ui-event/UIEvent.vue'
import UIFileInput from './ui-file-input/UIFileInput.vue'
import UIForm from './ui-form/UIForm.vue'
import UIGauge from './ui-gauge/UIGauge.vue'
import UIMarkdown from './ui-markdown/UIMarkdown.vue'
import UINotification from './ui-notification/UINotification.vue'
import UINumberInput from './ui-number-input/UINumberInput.vue'
import UIRadioGroup from './ui-radio-group/UIRadioGroup.vue'
import UISlider from './ui-slider/UISlider.vue'
import UISwitch from './ui-switch/UISwitch.vue'
import UITable from './ui-table/UITable.vue'
import UITemplate from './ui-template/UITemplate.vue'
import UIText from './ui-text/UIText.vue'
import UITextInput from './ui-text-input/UITextInput.vue'

// Named exports for use in other components
export {
    UIButton,
    UIButtonGroup,
    UIChart,
    UIControl,
    UIDropdown,
    UIEvent,
    UIFileInput,
    UIForm,
    UIGauge,
    UIMarkdown,
    UINotification,
    UINumberInput,
    UIRadioGroup,
    UISlider,
    UISwitch,
    UITable,
    UITemplate,
    UIText,
    UITextInput
}

// Component helpers
export { useDataTracker } from './data-tracker.mjs'

// Exported as an object for look up by widget name
export default {
    'ui-button': UIButton,
    'ui-button-group': UIButtonGroup,
    'ui-chart': UIChart,
    'ui-control': UIControl,
    'ui-dropdown': UIDropdown,
    'ui-event': UIEvent,
    'ui-file-input': UIFileInput,
    'ui-form': UIForm,
    'ui-gauge': UIGauge,
    'ui-markdown': UIMarkdown,
    'ui-notification': UINotification,
    'ui-number-input': UINumberInput,
    'ui-radio-group': UIRadioGroup,
    'ui-slider': UISlider,
    'ui-switch': UISwitch,
    'ui-table': UITable,
    'ui-template': UITemplate,
    'ui-text-input': UITextInput,
    'ui-text': UIText
}
