/*
// sorted imports - temporarily disabled until I get it all working again!
import UIButton from './ui-button/UIButton.vue'
import UIChart from './ui-chart/UIChart.vue'
import UIDropdown from './ui-dropdown/UIDropdown.vue'
import UIMarkdown from './ui-markdown/UIMarkdown.vue'
import UISlider from './ui-slider/UISlider.vue'
import UISwitch from './ui-switch/UISwitch.vue'
import UITemplate from './ui-template/UITemplate.vue'
import UIText from './ui-text/UIText.vue'
import UITextInput from './ui-text-input/UITextInput.vue'
*/

/* eslint-disable import/order */
/* eslint-disable n/no-missing-import */
/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/no-unresolved */
import UIButton from './ui-button/UIButton'
import UIDropdown from './ui-dropdown/UIDropdown'
import UITable from './ui-table/UITable'
import UIForm from './ui-form/UIForm'
import UIChart from './ui-chart/UIChart'
import UIRadioGroup from './ui-radio-group/UIRadioGroup'
import UISlider from './ui-slider/UISlider'
import UISwitch from './ui-switch/UISwitch'
import UINotification from './ui-notification/UINotification'
import UIMarkdown from './ui-markdown/UIMarkdown'
import UITemplate from './ui-template/UITemplate'
import UIText from './ui-text/UIText'
import UITextInput from './ui-text-input/UITextInput'
export default {
    'ui-button': UIButton,
    'ui-dropdown': UIDropdown,
    'ui-table': UITable,
    'ui-form': UIForm,
    'ui-chart': UIChart,
    'ui-radio-group': UIRadioGroup,
    'ui-slider': UISlider,
    'ui-switch': UISwitch,
    'ui-notification': UINotification,
    'ui-markdown': UIMarkdown,
    'ui-template': UITemplate,
    'ui-text': UIText,
    'ui-text-input': UITextInput
}
