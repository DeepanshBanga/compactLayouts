import { LightningElement, api } from 'lwc';
export default class LightningFormattedPhone extends LightningElement {
    @api value;
    connectedCallback() {
        this.textContent = this.value;
    }
}
