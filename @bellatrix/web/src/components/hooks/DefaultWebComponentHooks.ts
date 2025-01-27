import { WebComponentHooks } from '@bellatrix/web/components/utilities';
import { Anchor, Button, CheckBox, ColorInput, DateInput, DateTimeInput, EmailField, FileInput, MonthInput, NumberInput, PasswordField, PhoneField, RangeInput, SearchField, Select, TextArea, TextField, TimeInput, UrlField, WebComponent, WeekInput } from '@bellatrix/web/components';

export class DefaultWebComponentHooks {
    static addComponentBDDLogging(): void {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;// TODO: make it configurable
        const shouldObfuscatePassword = true; // TODO: add as option in configuration

        WebComponentHooks.addListenerTo(Anchor).before('click', (anchor) => console.log(`clicking ${anchor.componentName}`));
        WebComponentHooks.addListenerTo(Button).before('click', (button) => console.log(`clicking ${button.componentName}`));
        WebComponentHooks.addListenerTo(ColorInput).before('setColor', (colorInput, color) => console.log(`setting '${color}' into ${colorInput.componentName}`));
        WebComponentHooks.addListenerTo(CheckBox).before('check', (checkBox) => console.log(`checking ${checkBox.componentName}`));
        WebComponentHooks.addListenerTo(CheckBox).before('uncheck', (checkBox) => console.log(`unchecking ${checkBox.componentName}`));
        WebComponentHooks.addListenerTo(DateInput).before('setDate', (dateInput, date) => console.log(`setting ${dateInput.componentName} to ${date.toLocaleDateString(locale)}`));
        WebComponentHooks.addListenerTo(DateTimeInput).before('setTime', (dateTimeInput, dateTime) => console.log(`setting ${dateTimeInput.componentName} to ${dateTime.toLocaleString()}`));
        WebComponentHooks.addListenerTo(EmailField).before('setEmail', (emailField, email) => console.log(`typing '${email}' into ${emailField.componentName}`));
        WebComponentHooks.addListenerTo(FileInput).before('upload', (fileInput, filePath) => console.log(`uploading '${filePath}' into ${fileInput.componentName}`));
        WebComponentHooks.addListenerTo(MonthInput).before('setMonth', (monthInput, year, month) => console.log(`setting ${monthInput} to ${new Date(year, month - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`));
        WebComponentHooks.addListenerTo(NumberInput).before('setNumber', (numberInput, number) => console.log(`setting ${numberInput.componentName} to ${number}`));
        WebComponentHooks.addListenerTo(PasswordField).before('setPassword', (passwordField, password) => console.log(`typing ${shouldObfuscatePassword ? '********' : password} into ${passwordField.componentName}`));
        WebComponentHooks.addListenerTo(PhoneField).before('setPhone', (phoneField, phone) => console.log(`typing '${phone}' into ${phoneField.componentName}`));
        WebComponentHooks.addListenerTo(RangeInput).before('setValue', (rangeInput, value) => console.log(`setting ${rangeInput.componentName} to ${value}`));
        WebComponentHooks.addListenerTo(SearchField).before('setSearch', (searchField, search) => console.log(`typing '${search}' into ${searchField.componentName}`));
        WebComponentHooks.addListenerTo(Select).before('selectByText', (select, text) => console.log(`selecting '${text}' from ${select.componentName}`));
        WebComponentHooks.addListenerTo(Select).before('selectByIndex', (select, index) => console.log(`selecting index ${index} from ${select.componentName}`));
        WebComponentHooks.addListenerTo(Select).before('selectByValue', (select, value) => console.log(`selecting value="${value}" from ${select.componentName}`));
        WebComponentHooks.addListenerTo(TextArea).before('setText', (textArea, text) => console.log(`typing '${text}' into ${textArea.componentName}`));
        WebComponentHooks.addListenerTo(TextField).before('setText', (textField, text) => console.log(`typing '${text}' into ${textField.componentName}`));
        WebComponentHooks.addListenerTo(TimeInput).before('setTime', (timeInput, hours, minutes, seconds) => console.log(`setting ${timeInput.componentName} to ${[hours, minutes, seconds].map(n => String(n ?? 0).padStart(2, '0')).join(':')}`));
        WebComponentHooks.addListenerTo(UrlField).before('setUrl', (urlField, url) => console.log(`typing '${url}' into ${urlField.componentName}`));
        WebComponentHooks.addListenerTo(WeekInput).before('setWeek', (weekInput, year, weekNumber) => console.log(`setting ${weekInput.componentName} to ${year}-W${weekNumber.toString().padStart(2, '0')}`));
        WebComponentHooks.addListenerTo(WebComponent).before('scrollToVisible', (component) => console.log(`scrolling ${component} into view`));
        WebComponentHooks.addListenerTo(WebComponent).before('hover', (component) => console.log(`hovering ${component}`)); // TODO: add focus method?
    }
}
