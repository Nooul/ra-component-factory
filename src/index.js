import React from 'react';
import {
    ShowButton,
    CreateButton,
    EditButton,
    DeleteButton,
    TextInput,
    FormTab,
    Tab,
    ListButton
} from 'admin-on-rest';

export default class Factory {

    constructor(resource, config) {
        this.config = config;
        this.resource = resource;
        if (!config.roleEntryInLocalStorage) {
            this.userRole = "user_role";
        }
        else {
            this.userRole = config.roleEntryInLocalStorage;
        }
        if (!config.tabDelimiter) {
            this.tabDelimiter = "DELIMITER";
        }
        else {
            this.tabDelimiter = config.tabDelimiter;
        }
        if (!config.editReadOnlyStartsWith) {
            this.readOnlyInEdit = "_";
        }
        else {
            this.readOnlyInEdit = config.editReadOnlyStartsWith;
        }
    }

    create(action, prop, propPolicy) {
        let component = null;
        let role = localStorage.getItem(this.userRole);
        if (prop === "q" && action.startsWith("filter")) {
            return <TextInput label="Search in text fields" source="q" alwaysOn />;
        }

        if (!propPolicy) {
            propPolicy = this.getPropertyPolicy(prop, role, action);
        }
        let actionPolicy = this.getActionPolicy(role, action);
        if (!actionPolicy || "hidden" === propPolicy) {
            return '';
        }
        if (!this.config["resources"][this.resource]["props"][prop] || !this.config["resources"][this.resource]["props"][prop][propPolicy]) {
            return '';
        }

        component = this.config["resources"][this.resource]["props"][prop][propPolicy];
        return component;
    }

    createCreateButton(basePath) {
        let role = localStorage.getItem(this.userRole);
        let createPolicy = this.getActionPolicy(role, "create");
        if (createPolicy) {
            return (<CreateButton basePath={basePath} translate={true}/>);
        }
        else {
            return '';
        }
    }


    createShowButton(basePath,width) {
        let action = "show";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let showPolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        if (showPolicy) {
            return (<ShowButton basePath={basePath} translate={true}/>);
        }
        else {
            return '';
        }
    }

    createEditButton(basePath, width) {
        let action = "edit";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let editPolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        if (editPolicy) {
            return (<EditButton basePath={basePath} translate={true}/>);
        }
        else {
            return '';
        }
    }

    createDeleteButton(basePath, width) {
        let action = "delete";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let deletePolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        if (deletePolicy) {
            return (<DeleteButton basePath={basePath} translate={true}/>);
        }
        else {
            return '';
        }
    }

    createListButton(basePath, width) {
        let action = "list";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let listPolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        if (listPolicy) {
            return (<ListButton basePath={basePath}  translate={true}/>);
        }
        else {
            return '';
        }
    }

    canFilter(width) {
        let action = "filter";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let filterPolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        return filterPolicy;
    }

    canSeeMenuLink(width) {
        let action = "list";
        let mobileAction = action + ((width)? "_mobile":"");
        let role = localStorage.getItem(this.userRole);
        let listPolicy = (this.getActionPolicy(role, mobileAction) === undefined) ?
            this.getActionPolicy(role, action) : this.getActionPolicy(role, mobileAction);
        return listPolicy;
    }


    createAll(action) {
        let i = 0;
        let allProps = this.getCollectionOfProperties(action);
        let countOfTabs = this.countOfTabs(allProps);

        if (countOfTabs === 0) {
            return allProps.filter(a => a.prop !== this.tabDelimiter).map((p) => {
                let property = p.prop;
                let propPolicy = p.type;
                let comp = this.create(action, property, propPolicy);
                return React.cloneElement(comp, {key: i++});
            });
        }

        let tabs = [];
        let role = localStorage.getItem(this.userRole);

        for (let tabIndex = 0; tabIndex < countOfTabs; tabIndex++) {
            let components = this.getCollectionOfProperties(action, tabIndex).map((p) => {
                let property = p.prop;
                let propPolicy = p.type;
                let comp = this.create(action, property, propPolicy);
                return React.cloneElement(comp, {key: i++});
            });
            if (components.length === 0) {
                return '';
            }
            let tabLabel = "Tab "+(tabIndex+1);
            if (this.config["resources"][this.resource][role][action]["tabs"] &&
                this.config["resources"][this.resource][role][action]["tabs"][tabIndex]) {
                tabLabel = this.config["resources"][this.resource][role][action]["tabs"][tabIndex];
            }
            if (action === "create" || action === "edit") {
                tabs.push(React.cloneElement(<FormTab label={tabLabel}>{ components }</FormTab>, {key: i++}))
            }
            else if (action === "show") {
                tabs.push(<Tab label={tabLabel}>{ components }</Tab>)
            }
        }
        return tabs;
    }

    countOfTabs(props) {
        let count = 0;
        let hasTabs = false;
        for (let prop of props) {
            if (prop.prop === this.tabDelimiter) {
                count++;
                hasTabs = true;
            }
        }
        let lastEntry = props[props.length-1];
        if (lastEntry &&  lastEntry.prop && lastEntry.prop !== this.tabDelimiter && hasTabs) {
            count++;
        }

        return count;
    }

    getCollectionOfProperties(action, tab) {
         let role = localStorage.getItem(this.userRole);
         if (!this.config["resources"][this.resource] ||
            !this.config["resources"][this.resource][role] ||
            !this.config["resources"][this.resource][role][action]) {
                return [];
            }
        let props = this.config["resources"][this.resource][role][action]["props"];
        let allProps = [];

        if (Array.isArray(props)) {
            for (let prop of props) {
                let type;
                if (action.startsWith("edit")) {
                    if (prop.startsWith(this.readOnlyInEdit)) {
                      prop = prop.substring(1);
                      type = "field";
                    }
                    else {
                      type = "input";
                    }
                }
                else if (action.startsWith("create") || action.startsWith("filter")) {
                    type = "input";
                }
                else {
                    type = "field";
                }
                allProps.push({type: type, prop: prop});
            }
        }
        return this.choosePropertiesOfTab(action, allProps, tab);
    }

    choosePropertiesOfTab(action, allProps, tab) {
        if (tab === null || tab === undefined) {
            return allProps;
        }
        let listOfLists = [];
        let array = [];
        listOfLists.push(array);
        let currArray = listOfLists[listOfLists.length-1];
        for (let prop of allProps) {
            if (prop.prop !== this.tabDelimiter) {
                currArray.push(prop);
            }
            else {
                listOfLists.push([])
                currArray = listOfLists[listOfLists.length-1];
            }
        }
        return listOfLists[tab];
    }

    getActionPolicy(role, action) {
        if (this.config["resources"][this.resource] === undefined ||
            this.config["resources"][this.resource][role] === undefined ||
            this.config["resources"][this.resource][role][action] === undefined ||
            this.config["resources"][this.resource][role][action]["action"] === undefined) {
            return undefined;
        }

        let policy = this.config["resources"][this.resource][role][action]["action"];
        return policy;
    }

    getPropertyPolicy(prop, role, action) {
        if (!this.config["resources"][this.resource] ||
            !this.config["resources"][this.resource][role] ||
            !this.config["resources"][this.resource][role][action] ||
            !this.config["resources"][this.resource][role][action]["props"]) {
            return 'hidden';
        }
        let props = this.config["resources"][this.resource][role][action]["props"];

        if (!Array.isArray(props)) {
            return 'hidden';
        }

        if(props.indexOf(prop) > -1 && (action.startsWith("filter") || action.startsWith("create"))) {
            return "input";
        }
        else if(props.indexOf(prop) > -1 && !action.startsWith("edit")) {
            return "field";
        }
        else if (action.startsWith("edit")) {
            if (props.indexOf(this.readOnlyInEdit + prop) > -1) {
              return "field";
            }
            else if(props.indexOf(prop) > -1) {
              return "input";
            }
        }
        return 'hidden';
    }
}