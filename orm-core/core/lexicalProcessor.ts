// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MandarineORMException } from "./exceptions/mandarineORMException.ts";

export const lexicalProcessor = (currentProxy: Mandarine.ORM.RepositoryProxy, methodName: string, proxyType: Mandarine.ORM.ProxyType, tableMetadata: Mandarine.ORM.Entity.TableMetadata, entity: Mandarine.ORM.Entity.Table, dialect: Mandarine.ORM.Dialect.Dialect) => {

    const columnNamesCases: Map<String, String> = new Map<String, String>();
    entity.columns.forEach((item) => {
        columnNamesCases.set(<string> item.name, <string> item.name?.toLowerCase());
    });
    const columnNameEntries = Array.from(columnNamesCases.entries());

    let columnsNames = Array.from(columnNamesCases.values());
    methodName = methodName.replace(proxyType, "").toLowerCase();

    let mainQuery = "";

    switch(proxyType) {
        case "findBy":
            mainQuery += `${dialect.selectWhereStatement(tableMetadata)} `;
        break;
        case "countBy":
            mainQuery += `${dialect.selectAllCountWhereStatement(tableMetadata)} `;
        break;
        case "existsBy":
            mainQuery += `${dialect.selectAllCountWhereStatement(tableMetadata)} `;
        break;
        case "deleteBy":
            mainQuery += `${dialect.deleteWhereStatement(tableMetadata)} `;
        break;
    }

    let [parameterStrategy, parameterStrategyValue] = dialect.parameterizedQueryInformationType();
    const getParameterStrategyValue = (possibleValue?: any) => {
        switch(parameterStrategy) {
            case "number":
                return `$${possibleValue}`;
            case "string":
                return parameterStrategyValue;
        }
    }

    let currentWord = "";

    let queryData: Array<string> = new Array<string>();

    let colSecureId = 1;
    const addOperator = (operator: string, last: boolean) => {
        switch(operator) {
            case "=":
                queryData.push('=');
                queryData.push(getParameterStrategyValue(colSecureId));
                colSecureId++;
            break;

            case "and":
            case "or":
                if(!last) queryData.push(operator.toUpperCase());
            break;

            case "isnotnull":
                queryData.push("IS NOT NULL");
            break;

            case "isnull":
                queryData.push("IS NULL");
            break;

            case "isempty":
                queryData.push("=");
                queryData.push(`''`);
            break;

            case "isnotempty":
                queryData.push("<>");
                queryData.push(`''`);
            break;

            case "startingwith":
                queryData.push('LIKE');
                queryData.push(`'' || ${getParameterStrategyValue(colSecureId)} || '%'`);
                colSecureId++;
            break;

            case "endswith":
                queryData.push('LIKE');
                queryData.push(`'%' || ${getParameterStrategyValue(colSecureId)} || ''`);
                colSecureId++;
            break;

            case "like":
                queryData.push('LIKE');
                queryData.push(`'%' || ${getParameterStrategyValue(colSecureId)} || '%'`);
                colSecureId++;
            break;

            case "greaterthan":
                queryData.push('>')
                queryData.push(`${getParameterStrategyValue(colSecureId)}`);
                colSecureId++;
            break;

            case "lessthan":
                queryData.push('<')
                queryData.push(`${getParameterStrategyValue(colSecureId)}`);
                colSecureId++;
            break;

        }
    }

    const isColumn = (word: string): boolean => {
        return columnsNames.some(parameter => word == parameter);
    }

    const isOperator = (word: string): boolean => {
        return currentProxy.SUPPORTED_KEYWORDS.some(keyword => keyword == word);
    };

    let processorLogic = [];

    for(let i = 0; i<methodName.length; i++) {
        currentWord += methodName.charAt(i);
        if(isColumn(currentWord)) {
            processorLogic.push(currentWord);
            currentWord = "";
        } else if(isOperator(currentWord)) {
            processorLogic.push(currentWord);
            currentWord = "";
        }
    }

    for(let i = 0; i<processorLogic.length; i++) {
        let iterator = { previous: processorLogic[i - 1], current: processorLogic[i], next: processorLogic[i + 1] };
        const { previous, current, next } = iterator;

        if(current && isColumn(current)) {

            const originalName = columnNameEntries.find(([key, value]) => value === current);
            if(!originalName) throw new MandarineORMException(MandarineORMException.MQL_INVALID_KEY, "");
            queryData.push(dialect.getColumnNameForStatements(<string> originalName[0]));

            if(next && isOperator(next)) {
                if(next == 'and' || next == 'or') {
                    addOperator("=", false);
                }
                addOperator(next, false);
            }
            if(next == undefined && isOperator(previous) && (previous == 'and' || previous == 'or')) {
                addOperator("=", false);
            }
        } else if(current && isOperator(current)) {
            if(previous && isColumn(previous) && next && isOperator(next)) {
                addOperator(next, false);
            }
        }

        if(current && isColumn(current) && next == undefined && previous == undefined) {
            addOperator("=", false);
        }
    }

    mainQuery += queryData.join(" ");

    return mainQuery;
}