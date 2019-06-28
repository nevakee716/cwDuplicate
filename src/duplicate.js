(function(cwApi, $) {
    "use strict";
    // config
    var removeDiagramPopOut = true,
        historyBrowser = true;

    /********************************************************************************
    Custom Action for Single and Index Page : See Impact here http://bit.ly/2qy5bvB
    *********************************************************************************/
    cwCustomerSiteActions.doActionsForSingle_Custom = function(rootNode) {
        var currentView, url, i, cwView;
        currentView = cwAPI.getCurrentView();

        if (currentView) cwView = currentView.cwView;
        for (i in cwAPI.customLibs.doActionForSingle) {
            if (cwAPI.customLibs.doActionForSingle.hasOwnProperty(i)) {
                if (typeof cwAPI.customLibs.doActionForSingle[i] === "function") {
                    cwAPI.customLibs.doActionForSingle[i](rootNode, cwView);
                }
            }
        }
    };

    cwCustomerSiteActions.doActionsForIndex_Custom = function(rootNode) {
        var currentView, url, i, cwView;
        currentView = cwAPI.getCurrentView();

        if (currentView) cwView = currentView.cwView;
        for (i in cwAPI.customLibs.doActionForIndex) {
            if (cwAPI.customLibs.doActionForIndex.hasOwnProperty(i)) {
                if (typeof cwAPI.customLibs.doActionForIndex[i] === "function") {
                    cwAPI.customLibs.doActionForIndex[i](rootNode, cwView);
                }
            }
        }
    };

    cwCustomerSiteActions.duplication = {};
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

    cwCustomerSiteActions.duplication.addButton = function(rootNode) {
        try {
            // check creation and contributor
            if (cwAPI.cwUser.isCurrentUserSocial() === true || cwAPI.mm.getLookupsOnAccessRights(rootNode.objectTypeScriptName, "CanCreate").length == 0) {
                return;
            }
        } catch (e) {
            console.log(e);
            return;
        }

        var config;
        if (cwCustomerSiteActions.duplication.config[cwApi.getCurrentView().cwView]) {
            config = cwCustomerSiteActions.duplication.config[cwApi.getCurrentView().cwView];
        } else {
            config = cwCustomerSiteActions.duplication.config["default"];
        }

        cwAPI.CwWorkflowRestApi.getApprovers(cwApi.getCurrentView().cwView, rootNode.object_id, function(response) {
            let canDupe = false;
            if (response.approvers.length === 0) canDupe = true;
            response.approvers.forEach(function(approuver) {
                if (approuver.Id === cwAPI.currentUser.ID) {
                    canDupe = true;
                }
            });
            if (canDupe) {
                var duplicationButton = document.createElement("div");
                duplicationButton.innerHTML = '<a class="cw-edit-mode-button-edit cw-edit-mode-button page-action edit btn btn-edit no-text" title="Dupliquer"><span class="btn-text"></span><i class="fa fa-copy"></i></a>';

                var buttonContainer = document.querySelector(".cw-edit-buttons");
                buttonContainer.append(duplicationButton);
                cwCustomerSiteActions.duplication.addEventToDuplicateButton(rootNode,duplicationButton,config);
            }
        });
    };

    cwCustomerSiteActions.duplication.addEventToDuplicateButton = function(rootNode,duplicationButton,config) {
        var newObj = $.extend(true, {}, rootNode);

        newObj.properties = {};
        newObj.displayNames = {};
        newObj.associations = {};

        for (let i in rootNode.properties) {
            if (rootNode.properties.hasOwnProperty(i) && i !== "cwaveragerating" && i !== "cwtotalcomment" && i !== "exportflag") {
                let p = cwApi.mm.getProperty(rootNode.objectTypeScriptName, i);
                if (p) {
                    switch (p.type) {
                        case "Boolean":
                            if (rootNode.properties[i] === false) newObj.properties[i] = "0";
                            else newObj.properties[i] = "1";
                            break;
                        case "Lookup":
                            newObj.properties[i] = rootNode.properties[i + "_id"];
                            break;
                        case "Date":
                            newObj.properties[i] = moment(rootNode.properties[i]).format(cwAPI.cwPropertiesGroups.types.dateFormatForServer);
                            break;
                        case "URL":
                        default:
                            newObj.properties[i] = rootNode.properties[i];
                    }
                    newObj.displayNames[i] = p.name;
                }
            }
        }

        newObj.properties.name = rootNode.properties.name + "_" + Math.floor(Math.random() * 100);

        var newNewObj = $.extend(true, {}, newObj);

        var viewSchema = cwApi.ViewSchemaManager.getCurrentViewSchema();

        duplicationButton.addEventListener("click", function(event) {
            cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Create, null, newObj, 0, newObj.objectTypeScriptname, function(elem) {
                if (elem && elem.status == "Ok") {
                    newObj.object_id = elem.id;
                    for (let assNode in rootNode.associations) {
                        if (rootNode.associations.hasOwnProperty(assNode) && config.associationScriptNameToExclude.indexOf(viewSchema.NodesByID[assNode].AssociationTypeScriptName.toLowerCase()) === -1 && config.associationToTheMainObject && viewSchema.NodesByID[assNode].AssociationTypeScriptName !== config.associationToTheMainObject.associationTypeScriptName.toLowerCase()) {
                            newObj.associations[assNode] = {};
                            newObj.associations[assNode].items = [];
                            newObj.associations[assNode].associationScriptName = viewSchema.NodesByID[assNode].AssociationTypeScriptName;
                            newObj.associations[assNode].displayName = viewSchema.NodesByID[assNode].NodeName;

                            newNewObj.associations[assNode] = {};
                            newNewObj.associations[assNode].associationScriptName = viewSchema.NodesByID[assNode].AssociationTypeScriptName;
                            newNewObj.associations[assNode].displayName = viewSchema.NodesByID[assNode].NodeName;
                            newNewObj.associations[assNode].items = rootNode.associations[assNode];

                            newNewObj.associations[assNode].items.forEach(function(o) {
                                o.intersectionObjectUID = "";
                                o.isNew = "false";
                                o.targetObjectID = o.object_id;
                                o.targetObjectTypeScriptName = o.objectTypeScriptname;
                            });
                            newNewObj.object_id = newObj.object_id;
                        }
                    }

                    newNewObj.object_id = newObj.object_id;
                    if (config.associationToTheMainObject) {
                        newObj.associations["42"] = {};
                        newObj.associations["42"].items = [];
                        newObj.associations["42"].associationScriptName = config.associationToTheMainObject.associationTypeScriptName.toLowerCase();
                        newObj.associations["42"].displayName = config.associationToTheMainObject.displayName;

                        newNewObj.associations["42"] = {};
                        newNewObj.associations["42"].associationScriptName = config.associationToTheMainObject.associationTypeScriptName.toLowerCase();
                        newNewObj.associations["42"].displayName = config.associationToTheMainObject.displayName;
                        newNewObj.associations["42"].items = [
                            {
                                intersectionObjectUID: "",
                                isNew: "false",
                                targetObjectID: rootNode.object_id,
                                targetObjectTypeScriptName: rootNode.objectTypeScriptname,
                                name: rootNode.name
                            }
                        ];
                    }

                    cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Update, newObj, newNewObj, newObj.object_id, newObj.objectTypeScriptName, function(response) {
                        if (!cwApi.statusIsKo(response)) {
                            setTimeout(function() {
                                window.location.hash = cwApi.getSingleViewHash(newObj.objectTypeScriptName, newObj.object_id);
                            }, 1000);
                        }
                    });
                }
            });
        });
    };

    cwCustomerSiteActions.duplication.duplicationPopout = function(duplicateObject, object) {
        var output = document.createElement("div");
        output.className = "duplicatePopOut";

        var navigateTo = document.createElement("a");
        navigateTo.href = cwApi.getSingleViewHash(duplicateObject.objectTypeScriptName, duplicateObject.object_id);
        navigateTo.innerText = "Naviguer vers l'objet dupliqué";
        navigateTo.className = "duplicateNavigateButton";

        var navigateToNewWindows = document.createElement("a");
        navigateToNewWindows.href = cwApi.getSingleViewHash(duplicateObject.objectTypeScriptName, duplicateObject.object_id);
        navigateToNewWindows.target = "_blank";
        navigateToNewWindows.innerText = "Naviguer vers l'objet dupliqué dans un nouvel onglet";
        navigateToNewWindows.className = "duplicateNavigateButton";
        output.append(navigateTo);
        output.append(navigateToNewWindows);

        return output;
    };
    /********************************************************************************
    Configs : add trigger for single page
    *********************************************************************************/
    if (cwAPI.customLibs === undefined) {
        cwAPI.customLibs = {};
    }
    if (cwAPI.customLibs.doActionForSingle === undefined) {
        cwAPI.customLibs.doActionForSingle = {};
    }

    cwAPI.customLibs.doActionForSingle.duplication = cwCustomerSiteActions.duplication.addButton;
})(cwAPI, jQuery);
