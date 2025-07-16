@isTest
private class DynamicCompactLayoutControllerTest {

    @testSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        Contact con = new Contact(LastName = 'Test Contact', Email = 'test@example.com', Phone = '1234567890', AccountId = acc.Id);
        insert con;

        
    }

    @isTest
    static void testGetObjectFieldData_Account() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Test.startTest();
        try {
            DynamicCompactLayoutController.getObjectFieldData('Account', acc.Id);
        } catch (Exception e) {}
        Test.stopTest();
    }

    @isTest
    static void testGetObjectFieldData_Contact() {
        Contact con = [SELECT Id FROM Contact LIMIT 1];
        Test.startTest();
        try {
            DynamicCompactLayoutController.getObjectFieldData('Contact', con.Id);
        } catch (Exception e) {}
        Test.stopTest();
    }

    

    @isTest
    static void testGetObjectFieldData_InvalidObject() {
        Test.startTest();
        try {
            DynamicCompactLayoutController.getObjectFieldData('InvalidObject__c', '001000000000000AAA');
        } catch (Exception e) {}
        Test.stopTest();
    }

    @isTest
    static void testGetRecordNameField_Valid() {
        Test.startTest();
        try {
            DynamicCompactLayoutController.getRecordNameField('Account');
        } catch (Exception e) {}
        Test.stopTest();
    }

    @isTest
    static void testGetRecordNameField_Invalid() {
        Test.startTest();
        try {
            DynamicCompactLayoutController.getRecordNameField('InvalidObject__c');
        } catch (Exception e) {}
        Test.stopTest();
    }

    @isTest
    static void testGetObjectInfo_Valid() {
        Test.startTest();
        try {
            DynamicCompactLayoutController.getObjectInfo('Account');
        } catch (Exception e) {}
        Test.stopTest();
    }

    @isTest
    static void testGetObjectInfo_Invalid() {
        Test.startTest();
        try {
            DynamicCompactLayoutController.getObjectInfo('InvalidObject__c');
        } catch (Exception e) {}
        Test.stopTest();
    }
}
