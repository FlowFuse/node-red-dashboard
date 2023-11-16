import UIButton from './ui-button/UIButton.vue'
import UIChart from './ui-chart/UIChart.vue'
import UIDropdown from './ui-dropdown/UIDropdown.vue'
import UIForm from './ui-form/UIForm.vue'
import UIMarkdown from './ui-markdown/UIMarkdown.vue'
import UINotification from './ui-notification/UINotification.vue'
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
    UIChart,
    UIDropdown,
    UIForm,
    UIMarkdown,
    UINotification,
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
    'ui-chart': UIChart,
    'ui-dropdown': UIDropdown,
    'ui-form': UIForm,
    'ui-markdown': UIMarkdown,
    'ui-notification': UINotification,
    'ui-radio-group': UIRadioGroup,
    'ui-slider': UISlider,
    'ui-switch': UISwitch,
    'ui-table': UITable,
    'ui-template': UITemplate,
    'ui-text-input': UITextInput,
    'ui-text': UIText
}
