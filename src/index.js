import React from 'react';
import {
    ShowButton,
    CreateButton,
    EditButton,
    DeleteButton,
    TextInput
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
        if (prop === "q" && action === "filter") {
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
            return (<CreateButton redirect={false} basePath={basePath} translate={true}/>);
        }
        else {
            return '';
        }
    }


    createShowButton() {
        let role = localStorage.getItem(this.userRole);
        let showPolicy = this.getActionPolicy(role, "show");
        if (showPolicy) {
            return (<ShowButton translate={true}/>);
        }
        else {
            return '';
        }
    }

    createEditButton() {
        let role = localStorage.getItem(this.userRole);
        let editPolicy = this.getActionPolicy(role, "edit");
        if (editPolicy) {
            return (<EditButton redirect={false} translate={true}/>);
        }
        else {
            return '';
        }
    }

    createDeleteButton() {
        let role = localStorage.getItem(this.userRole);
        let deletePolicy = this.getActionPolicy(role, "delete");
        if (deletePolicy) {
            return (<DeleteButton translate={true}/>);
        }
        else {
            return '';
        }
    }

    canFilter() {
        let role = localStorage.getItem(this.userRole);
        let filterPolicy = this.getActionPolicy(role, "filter");
        return filterPolicy;
    }

    canSeeMenuLink() {
        let role = localStorage.getItem(this.userRole);
        let filterPolicy = this.getActionPolicy(role, "list");
        return filterPolicy;
    }

    createAll(action, tab) { //tab is optional
        let i = 0;
        let components =  this.getCollectionOfProperties(action, tab).map((p) => {
            let property = p.prop;
            let propPolicy = p.type;
            let comp = this.create(action, property, propPolicy);
            return React.cloneElement(comp, {key: i++});
        });
        if (components.length === 0) {
            return '';
        }
        return components;
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
                if (action === "edit") {
                    if (prop.startsWith(this.readOnlyInEdit)) {
                      prop = prop.substring(1);
                      type = "field";
                    }
                    else {
                      type = "input";
                    }
                }
                else if (action === "create" || action === "filter") {
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
            return allProps.filter(a => a.prop !== this.tabDelimiter);
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
        if (!this.config["resources"][this.resource] ||
            !this.config["resources"][this.resource][role] ||
            !this.config["resources"][this.resource][role][action] ||
            !this.config["resources"][this.resource][role][action]["action"]) {
            return false;
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

        if(props.indexOf(prop) > -1 && (action === "filter" || action == "create")) {
            return "input";
        }
        else if(props.indexOf(prop) > -1 && action !== "edit") {
            return "field";
        }
        else if (action === "edit") {
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