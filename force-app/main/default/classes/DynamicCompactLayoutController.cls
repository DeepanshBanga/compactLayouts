public with sharing class DynamicCompactLayoutController {
    @AuraEnabled(cacheable=true)
    public static List<String> getFields(String objectApiName) {
        List<String> fieldList = new List<String>();
        for (Compact_Layout_Config__mdt layoutField : [
            SELECT Field_API_Name__c 
            FROM Compact_Layout_Config__mdt 
            WHERE Object_API_Name__c = :objectApiName
        ]) {
            fieldList.add(layoutField.Field_API_Name__c);
        }
        return fieldList;
    }
}
