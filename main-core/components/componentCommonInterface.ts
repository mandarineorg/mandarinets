export interface ComponentCommonInterface {
    name?: string;
    classHandler?: any;
    getName: () => string;
    getClassHandler: () => any;
    setClassHandler: (classHandler: any) => void;
}