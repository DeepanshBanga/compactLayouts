import { LightningElement, api } from 'lwc';
export default class LightningFormattedUrl extends LightningElement {
    @api value;
    connectedCallback() {
        this.textContent = this.value;
    }
}
