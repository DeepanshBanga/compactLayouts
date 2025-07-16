import { LightningElement, api, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';
import getObjectFieldData from '@salesforce/apex/DynamicCompactLayoutController.getObjectFieldData';
import getRecordNameField from '@salesforce/apex/DynamicCompactLayoutController.getRecordNameField';
import getObjectInfo from '@salesforce/apex/DynamicCompactLayoutController.getObjectInfo';

export default class DynamicCompactLayout extends LightningElement {
    @api recordId;
    @api objectApiName;

    objectLabel;
    objectIconUrl;
    recordName;
    recordFields = [];
    error;

    // Store dynamic recordName field (e.g., 'Email')
    recordNameField;
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectMetadata({ data, error }) {
        if (data) {
            this.objectLabel = data.label;
            this.objectIconUrl = data.iconUrl; // or use SLDS icon fallback
        } else if (error) {
            this.error = error.body.message;
        }
    }
    
    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: ['Compact'], modes: ['View'] })
    wiredRecordUi({ data, error }) {
        if (data) {
            const objInfo = data.objectInfos[this.objectApiName];
            this.objectLabel = objInfo?.label;
            this.objectIconUrl = objInfo?.apiName
                ? `standard:${objInfo.apiName.toLowerCase()}`
                : 'standard:default';

            const recData = data.records[this.recordId];

            if (recData?.fields && this.recordNameField && recData.fields[this.recordNameField]) {
                this.recordName = recData.fields[this.recordNameField].value;
            } else if (recData?.fields?.Name) {
                this.recordName = recData.fields.Name.value;
            } else if (recData?.fields?.FirstName && recData?.fields?.LastName) {
                this.recordName = `${recData.fields.FirstName.value} ${recData.fields.LastName.value}`;
            } else {
                this.recordName = '';
            }

        } else if (error) {
            console.error('Error loading record UI:', error);
        }
    }

    connectedCallback() {
        console.log('recordId:', this.recordId);
        console.log('objectApiName (before fallback):', this.objectApiName);

        if (!this.objectApiName && this.recordId) {
            const prefix = this.recordId.substring(0, 3);
            const knownPrefixes = {
                '001': 'Account',
                '003': 'Contact',
                '005': 'User',
                '006': 'Opportunity',
                '500': 'Case'
            };
            this.objectApiName = knownPrefixes[prefix] || null;
            console.warn(`Fallback inferred objectApiName: ${this.objectApiName}`);
        }

        // Fetch the dynamic record name field from metadata
        if (this.objectApiName) {
            getRecordNameField({ objectApiName: this.objectApiName })
                .then(fieldName => {
                    this.recordNameField = fieldName;
                })
                .catch(error => {
                    console.error('Error getting record name field:', error);
                });
        }

        // Get the rest of the field data
        if (this.objectApiName && this.recordId) {
            getObjectFieldData({ objectApiName: this.objectApiName, recordId: this.recordId })
                .then(result => {
                    this.recordFields = result.map(field => {
                        const type = field.type?.toLowerCase();
                        return {
                            ...field,
                            isEmail: type === 'email',
                            isPhone: type === 'phone',
                            isUrl: type === 'url',
                            isDate: type === 'date',
                            isDatetime: type === 'datetime',
                            isCurrency: type === 'currency',
                            isBoolean: type === 'boolean',
                            emailHref: type === 'email' ? `mailto:${field.value}` : '',
                            phoneHref: type === 'phone' ? `tel:${field.value}` : ''
                        };
                    });
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error?.body?.message || error?.message || JSON.stringify(error);
                    console.error('Apex Error:', this.error);
                });
        } else {
            this.error = 'Missing objectApiName or recordId';
            console.error(this.error);
        }
    }
}