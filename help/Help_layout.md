| **Name** |  Version | **Updated by** |
| --- | --- | --- |
| **Duplicate** | 1.0 | Mathias PFAUWADEL |


## Description 
Add a button to duplicate your object

## Installation
https://github.com/casewise/cpm/wiki

## Parameter setup 

(to be configure in C:\Casewise\Evolve\Site\bin\webDesigner\custom\Marketplace\libs\cwDuplicate\src\duplicate.js)

```
    cwCustomerSiteActions.duplication.config = {
        process: {
            associationScriptNameToExclude: ["anyobjectexplodedasdiagram", "anyobjectshownasshapeindiagram"],
            associationToTheMainObject: {
                associationTypeScriptName: "processtoassoprocessusprocessusvariantereversetoprocess",
                displayName: "Est la variante de"
            }
        },
        default: {
            associationScriptNameToExclude: ["anyobjectexplodedasdiagram", "anyobjectshownasshapeindiagram"]
        }
    };
```

By default, clicking on the button will duplicate your object, the name will be name + a random number
It will copy all the property of the evolve page and all the association.

In order to see the duplicate button, an cwUser must be able to create the objectType. You need to be an approuver of the view or the view need to have no approuvers

You use a specific configuration for your view, here we have an exemple with the view process.

### associationScriptNameToExclude : 

List the Association Type ScriptName you want to exclude from the duplication
Always exclude "anyobjectexplodedasdiagram", "anyobjectshownasshapeindiagram" cause we cannot duplicate association with diagram.

### associationToTheMainObject

This option help you to create an association between your duplicate and your main object.
associationTypeScriptName correspond to the association type scriptname
and display Name correspond to the label you wanted to be display inside evolve changeset



### PS : 

Please be correct to the direction of your association type scriptname, you can find the information inside model explorer

![](https://raw.githubusercontent.com/nevakee716/cwDuplicate/master/screen/1.png) 

