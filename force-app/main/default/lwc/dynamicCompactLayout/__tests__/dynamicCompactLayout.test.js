import { createElement } from 'lwc';
import DynamicCompactLayout from 'c/dynamicCompactLayout';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { getRecordUi } from 'lightning/uiRecordApi';

// Register wire adapter
const getRecordUiAdapter = registerLdsTestWireAdapter(getRecordUi);

// Utility to wait for promises
function flushPromises() {
    return new Promise(resolve => setTimeout(resolve));
}

// Mock Apex methods
jest.mock(
    '@salesforce/apex/DynamicCompactLayoutController.getRecordNameField',
    () => {
        return {
            default: jest.fn(() => Promise.resolve('Name'))
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/DynamicCompactLayoutController.getObjectFieldData',
    () => {
        return {
            default: jest.fn(() =>
                Promise.resolve([
                    {
                        label: 'Industry',
                        value: 'Education',
                        type: 'String',
                        apiName: 'Industry'
                    },
                    {
                        label: 'Account Phone',
                        value: '(520) 773-9050',
                        type: 'Phone',
                        apiName: 'Phone'
                    },
                    {
                        label: 'Website',
                        value: 'https://www.universityofarizona.com',
                        type: 'Url',
                        apiName: 'Website'
                    }
                ])
            )
        };
    },
    { virtual: true }
);

describe('c-dynamic-compact-layout - Account (University of Arizona)', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders Account label and record fields', async () => {
        const element = createElement('c-dynamic-compact-layout', {
            is: DynamicCompactLayout
        });

        element.recordId = '001XYZ000000123AAA';
        element.objectApiName = 'Account';

        document.body.appendChild(element);

        // Mock data for getRecordUi wire
        getRecordUiAdapter.emit({
            objectInfos: {
                Account: {
                    apiName: 'Account',
                    label: 'Account'
                }
            },
            records: {
                '001XYZ000000123AAA': {
                    fields: {
                        Name: {
                            value: 'University of Arizona'
                        }
                    }
                }
            }
        });

        await flushPromises();

        // Check heading (object label)
        const heading = element.shadowRoot.querySelector('h1');
        expect(heading.textContent).toBe('Account');

        // Check record name
        const name = element.shadowRoot.querySelector('p.slds-text-body_regular');
        expect(name.textContent).toBe('University of Arizona');

        // Check field values
        const paragraphs = Array.from(
            element.shadowRoot.querySelectorAll('lightning-formatted-text, lightning-formatted-phone, lightning-formatted-url')
        ).map(el => el.textContent);

        expect(paragraphs).toContain('Education');
        expect(paragraphs).toContain('(520) 773-9050');
        expect(paragraphs).toContain('https://www.universityofarizona.com');
    });
});
