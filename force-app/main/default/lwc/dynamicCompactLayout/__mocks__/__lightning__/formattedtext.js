import { LightningElement, api } from 'lwc';
export default class LightningFormattedText extends LightningElement {
    @api value;
    connectedCallback() {
        this.textContent = this.value;
    }
}
