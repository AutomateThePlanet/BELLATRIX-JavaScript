import { BellatrixComponent } from '@bellatrix/web/components/decorators';
import { WebComponent } from '@bellatrix/web/components';

@BellatrixComponent
export class Select extends WebComponent<HTMLSelectElement> {

    async getSelected(): Promise<void> {
        // TODO: TO IMPLEMENT THIS, FIRST A RELATIVE CREATION OF COMPONENTS MUST BE IMPLEMENTED

        //        String optionValue = (String)this.wrappedElement.evaluate("selectElement => {" +
        //                "    const selectedOption = selectElement.options[selectElement.selectedIndex];" +
        //                "    return selectedOption.getAttribute('value');" +
        //                "}"
        //        );
        //
        //        return this.create().byXpath(Option.class, String.format("//option[@value='%s']", optionValue));
    }

        //
        //    public List<Option> getAllOptions() {
        //        try {
        //            return this.create().allByXpath(Option.class, "//option");
        //        } catch (Exception ex) {
        //            DebugInformation.printStackTrace(ex);
        //            return null;
        //        }
        //    }
        //

    async selectByText(text: string): Promise<void> {
        await this.wrappedElement.selectByText(text);
    }

    async selectByValue(value: string): Promise<void> {
        await this.wrappedElement.selectByValue(value);
    }

    async selectByIndex(index: number): Promise<void> {
        await this.wrappedElement.selectByIndex(index);
    }

    async isDisabled(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('disabled')).toLowerCase() === 'true';
    }

    async isReadonly(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('readonly')).toLowerCase() === 'true';
    }

    async isRequired(): Promise<boolean> {
        return (await this.wrappedElement.getAttribute('required')).toLowerCase() === 'true';
    }
}