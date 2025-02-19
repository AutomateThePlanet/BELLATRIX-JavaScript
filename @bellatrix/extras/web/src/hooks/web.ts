import { WebComponentHooks } from '@bellatrix/web/components/utilities';
import {
    Anchor,
    Button,
    CheckBox,
    ColorInput,
    DateInput,
    DateTimeInput,
    EmailField,
    FileInput,
    MonthInput,
    NumberInput,
    PasswordField,
    PhoneField,
    RangeInput,
    SearchField,
    Select,
    TextArea,
    TextField,
    TimeInput,
    UrlField,
    WebComponent,
    WeekInput
} from '@bellatrix/web/components';

export class ExtraWebHooks {
    static addComponentBDDLogging(): void {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale; // TODO: add locale option in the config

        WebComponentHooks.addListenerTo(Anchor).before('click', function() { console.log(`clicking ${this.componentName}`); });
        WebComponentHooks.addListenerTo(Button).before('click', function() { console.log(`clicking ${this.componentName}`); });
        WebComponentHooks.addListenerTo(ColorInput).before('setColor', function(color) { console.log(`setting '${color}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(CheckBox).before('check', function() { console.log(`checking ${this.componentName}`); });
        WebComponentHooks.addListenerTo(CheckBox).before('uncheck', function() { console.log(`unchecking ${this.componentName}`); });
        WebComponentHooks.addListenerTo(DateInput).before('setDate', function(date) { console.log(`setting ${this.componentName} to ${date.toLocaleDateString(locale)}`); });
        WebComponentHooks.addListenerTo(DateTimeInput).before('setTime', function(dateTime) { console.log(`setting ${this.componentName} to ${dateTime.toLocaleString()}`); });
        WebComponentHooks.addListenerTo(EmailField).before('setEmail', function(email) { console.log(`typing '${email}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(FileInput).before('upload', function(filePath) { console.log(`uploading '${filePath}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(MonthInput).before('setMonth', function(year, month) { console.log(`setting ${this.componentName} to ${new Date(year, month - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`); });
        WebComponentHooks.addListenerTo(NumberInput).before('setNumber', function(number) { console.log(`setting ${this.componentName} to ${number}`); });
        WebComponentHooks.addListenerTo(PasswordField).before('setPassword', function() { console.log(`typing '********' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(PhoneField).before('setPhone', function(phone) { console.log(`typing '${phone}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(RangeInput).before('setValue', function(value) { console.log(`setting ${this.componentName} to ${value}`); });
        WebComponentHooks.addListenerTo(SearchField).before('setSearch', function(search) { console.log(`typing '${search}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(Select).before('selectByText', function(text) { console.log(`selecting '${text}' from ${this.componentName}`); });
        WebComponentHooks.addListenerTo(Select).before('selectByIndex', function(index) { console.log(`selecting index ${index} from ${this.componentName}`); });
        WebComponentHooks.addListenerTo(Select).before('selectByValue', function(value) { console.log(`selecting value="${value}" from ${this.componentName}`); });
        WebComponentHooks.addListenerTo(TextArea).before('setText', function(text) { console.log(`typing '${text}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(TextField).before('setText', function(text) { console.log(`typing '${text}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(TimeInput).before('setTime', function(hours, minutes, seconds) { console.log(`setting ${this.componentName} to ${[hours, minutes, seconds].map(n => String(n ?? 0).padStart(2, '0')).join(':')}`); });
        WebComponentHooks.addListenerTo(UrlField).before('setUrl', function(url) { console.log(`typing '${url}' into ${this.componentName}`); });
        WebComponentHooks.addListenerTo(WeekInput).before('setWeek', function(year, weekNumber) { console.log(`setting ${this.componentName} to ${year}-W${weekNumber.toString().padStart(2, '0')}`); });
        WebComponentHooks.addListenerTo(WebComponent).before('scrollIntoView', function() { console.log(`scrolling ${this.componentName} into view`); });
        WebComponentHooks.addListenerTo(WebComponent).before('hover', function() { console.log(`hovering ${this.componentName}`); });
        WebComponentHooks.addListenerTo(WebComponent).before('focus', function() { console.log(`focusing ${this.componentName}`); });
    }
}
