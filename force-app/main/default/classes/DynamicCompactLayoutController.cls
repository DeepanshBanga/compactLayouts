public with sharing class DynamicCompactLayoutController {

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getObjectFieldData(String objectApiName, Id recordId) {
        if (String.isBlank(objectApiName)) {
            throw new AuraHandledException('Missing object API name.');
        }

        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe()
            .get(objectApiName)
            .getDescribe()
            .fields.getMap();

        List<Compact_Layout_Config__mdt> configs = [
            SELECT Field_API_Name__c 
            FROM Compact_Layout_Config__mdt 
            WHERE Object_API_Name__c = :objectApiName
        ];

        List<String> selectFields = new List<String>();
        Set<String> relationshipFields = new Set<String>();
        Map<String, String> referenceFieldToRelationshipName = new Map<String, String>();

        for (Compact_Layout_Config__mdt config : configs) {
            String fieldName = config.Field_API_Name__c;
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDesc = fieldMap.get(fieldName).getDescribe();
                selectFields.add(fieldName);

                if (fieldDesc.getType() == Schema.DisplayType.REFERENCE) {
                    String relationshipName = fieldDesc.getRelationshipName();
                    if (String.isNotBlank(relationshipName)) {
                        relationshipFields.add(relationshipName + '.Name');
                        referenceFieldToRelationshipName.put(fieldName, relationshipName);
                    }
                }
            }
        }

        List<String> finalFields = new List<String>(selectFields);
        finalFields.addAll(relationshipFields);

        SObject recordObj;
        try {
            String soql = 'SELECT ' + String.join(finalFields, ', ') +
                        ' FROM ' + objectApiName +
                        ' WHERE Id = :recordId LIMIT 1';
            recordObj = Database.query(soql);
        } catch (Exception e) {
            throw new AuraHandledException('SOQL error: ' + e.getMessage());
        }

        List<Map<String, String>> result = new List<Map<String, String>>();
        for (String fieldName : selectFields) {
            if (fieldMap.containsKey(fieldName)) {
                Schema.DescribeFieldResult fieldDesc = fieldMap.get(fieldName).getDescribe();
                Schema.DisplayType type = fieldDesc.getType();

                Object value;
                if (type == Schema.DisplayType.REFERENCE && referenceFieldToRelationshipName.containsKey(fieldName)) {
                    String relName = referenceFieldToRelationshipName.get(fieldName);
                    SObject relatedRecord = recordObj.getSObject(relName);
                    value = relatedRecord != null ? relatedRecord.get('Name') : null;
                } else {
                    value = recordObj.get(fieldName);
                }

                Map<String, String> fieldData = new Map<String, String>();
                fieldData.put('label', fieldDesc.getLabel());
                fieldData.put('apiName', fieldName);
                fieldData.put('value', value != null ? String.valueOf(value) : '');
                fieldData.put('type', String.valueOf(type));
                result.add(fieldData);
            }
        }

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static String getRecordNameField(String objectApiName) {
        String recordNameKey = objectApiName + 'LabelVal';

        try {
            List<Compact_Layout_Config__mdt> config = [
                SELECT DeveloperName, Field_API_Name__c 
                FROM Compact_Layout_Config__mdt 
                WHERE DeveloperName = :recordNameKey 
                LIMIT 1
                ];

                if (!config.isEmpty()) {
                    return config[0].Field_API_Name__c;
                }
            } catch (Exception e) {
            throw new AuraHandledException('Error getting record label field: ' + e.getMessage());
        }

        return null;
    }
}