import { Test, DenoAsserts, Orange } from "../../mod.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";

export class CommonUtilsTest {

    @Test({
        name: "Test getVariableReference",
        description: "Should get a list of all the variable references in an string"
    })
    public testVariablesReferences() {
        let str = `
            Hello ${"${PERSON_NAME}"},
            I hope you are doing well.
            This is a message from ${"${FRAMEWORK}"}
        `;

        Deno.env.set("PERSON_NAME", "You");
        Deno.env.set("FRAMEWORK", "Mandarine");

        let references = CommonUtils.getVariableReference(str);
        DenoAsserts.assertEquals(references, [{
            variable: "PERSON_NAME",
            fullReference: "${PERSON_NAME}",
            environmentalValue: "You"
        },
        {
            variable: "FRAMEWORK",
            fullReference: "${FRAMEWORK}",
            environmentalValue: "Mandarine"
        }]);

    }

    @Test({
        name: "test processVariableReferencesForEnvironmental",
        description: "Should replace env references for env values" 
    })
    public testprocessVariableReferencesForEnvironmental() {
        let actual = `
            Hello ${"${PERSON_NAME}"},
            I hope you are doing well.
            This is a message from ${"${FRAMEWORK}"}
        `;

        let expected = `
            Hello You,
            I hope you are doing well.
            This is a message from Mandarine
        `;

        Deno.env.set("PERSON_NAME", "You");
        Deno.env.set("FRAMEWORK", "Mandarine");

        let result = CommonUtils.processVariableReferencesForEnvironmental(actual);

        DenoAsserts.assertEquals(result, expected);
    }

}