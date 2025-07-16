import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRecordUi } from 'lightning/uiRecordApi';

import FIELD_API_NAMES_FIELD from '@salesforce/schema/Compact_Layout_Config__mdt.Field_API_Names__c';
import OBJECT_API_NAME_FIELD from '@salesforce/schema/Compact_Layout_Config__mdt.Object_API_Name__c';
import FIELD_API_NAME_FIELD from '@salesforce/schema/Compact_Layout_Config__mdt.Field_API_Name__c';
export default class DynamicCompactLayout extends LightningElement {
    @api recordId;
    @api objectApiName;

    objectLabel;
    objectIconUrl;
    recordName;
    recordFields = [];
    error;

    fieldApiNames = [];

    staticConfigRecordIds = {
        Account: 'm00NS00001O0Qoz',   
        Contact: 'm00NS00001O0S1B'
    };

    get configRecordId() {
        return this.staticConfigRecordIds[this.objectApiName];
    }

    @wire(getRecord, {
        recordId: '$configRecordId',
        fields: [FIELD_API_NAMES_FIELD, OBJECT_API_NAME_FIELD]
    })
    configRecord({ data, error }) {
        if (data) {
            const csv = getFieldValue(data, FIELD_API_NAMES_FIELD);
            if (csv) {
                this.fieldApiNames = csv.split(',').map(f => f.trim());
                this.error = undefined;
            }
        } else if (error) {
            this.error = 'Error loading config: ' + (error.body?.message || error.message);
            console.error(this.error);
        }
    }

    @wire(getRecordUi, {
        recordIds: '$recordId',
        layoutTypes: ['Compact'],
        modes: ['View']
    })
    recordData({ data, error }) {
        if (data && this.fieldApiNames.length > 0) {
            const rec = data.records[this.recordId];
            const objInfo = data.objectInfos[this.objectApiName];

            this.recordFields = this.fieldApiNames.map(apiName => {
                const fieldData = rec.fields[apiName];
                const value = fieldData?.value || '';
                const lower = apiName.toLowerCase();
                return {
                    label: fieldData?.label || apiName,
                    apiName: apiName,
                    value: value,
                    isEmail: lower.includes('email'),
                    isPhone: lower.includes('phone'),
                    isUrl: lower.includes('url') || lower.includes('website'),
                    isDate: lower.includes('date'),
                    isBoolean: lower.startsWith('is') || lower.startsWith('has')
                };
            });

            this.recordName = rec.fields?.Name?.value || '';
            this.objectLabel = objInfo?.label || this.objectApiName;
            this.objectIconUrl = objInfo?.apiName ? `standard:${objInfo.apiName.toLowerCase()}` : 'standard:default';
            this.error = undefined;
        } else if (error) {
            this.error = 'Error loading record: ' + (error.body?.message || error.message);
            console.error(this.error);
        }
    }

    connectedCallback() {
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
            console.warn(`Inferred objectApiName: ${this.objectApiName}`);
        }
    }
}
