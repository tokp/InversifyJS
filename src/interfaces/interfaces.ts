namespace interfaces {

    export interface Newable<T> {
        new (...args: any[]): T;
    }

    export interface Abstract<T> {
         prototype: T;
    }

    export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

    export interface Binding<T> extends Clonable<Binding<T>> {
        guid: string;
        moduleId: string;
        activated: boolean;
        serviceIdentifier: ServiceIdentifier<T>;
        implementationType: Newable<T>;
        factory: FactoryCreator<any>;
        provider: ProviderCreator<any>;
        constraint: ConstraintFunction;
        onActivation: (context: Context, injectable: T) => T;
        cache: T;
        dynamicValue: (context: Context) => T;
        scope: number; // BindingScope
        type: number; // BindingType
    }

    export interface Factory<T> extends Function {
        (...args: any[]): (((...args: any[]) => T) | T);
    }

    export interface FactoryCreator<T> extends Function {
        (context: Context): Factory<T>;
    }

    export interface Provider<T> extends Function {
        (): Promise<T>;
    }

    export interface ProviderCreator<T> extends Function {
        (context: Context): Provider<T>;
    }

    export interface NextArgs {
        avoidConstraints: boolean;
        contextInterceptor?: (contexts: Context) => Context;
        isMultiInject: boolean;
        targetType: number;
        serviceIdentifier: interfaces.ServiceIdentifier<any>;
        key?: string;
        value?: any;
    }

    export interface Next {
        (args: NextArgs): (any|any[]);
    }

    export interface Middleware extends Function {
        (next: Next): Next;
    }

    export interface ContextInterceptor extends Function {
        (context: interfaces.Context): interfaces.Context;
    }

    export interface Context {
        guid: string;
        container: Container;
        plan: Plan;
        addPlan(plan: Plan): void;
    }

    export interface ReflectResult {
        [key: string]: Metadata[];
    }

    export interface Metadata {
        key: string;
        value: any;
    }

    export interface Plan {
        parentContext: Context;
        rootRequest: Request;
    }

    export interface QueryableString {
        startsWith(searchString: string): boolean;
        endsWith(searchString: string): boolean;
        contains(searchString: string): boolean;
        equals(compareString: string): boolean;
        value(): string;
    }

    export interface Request {
        guid: string;
        serviceIdentifier: ServiceIdentifier<any>;
        parentContext: Context;
        parentRequest: Request;
        childRequests: Request[];
        target: Target;
        bindings: Binding<any>[];
        addChildRequest(
            serviceIdentifier: ServiceIdentifier<any>,
            bindings: (Binding<any> | Binding<any>[]),
            target: Target
        ): Request;
    }

    export interface Target {
        guid: string;
        serviceIdentifier: ServiceIdentifier<any>;
        type: number; // TargetType
        name: QueryableString;
        metadata: Array<Metadata>;
        getNamedTag(): interfaces.Metadata;
        getCustomTags(): interfaces.Metadata[];
        hasTag(key: string): boolean;
        isArray(): boolean;
        matchesArray(name: interfaces.ServiceIdentifier<any>): boolean;
        isNamed(): boolean;
        isTagged(): boolean;
        matchesNamedTag(name: string): boolean;
        matchesTag(key: string): (value: any) => boolean;
    }

    export type ContainerOptionsScope = "singleton" | "transient";

    export interface ContainerOptions {
        defaultScope: ContainerOptionsScope;
    }

    export interface Container {
        guid: string;
        parent: Container;
        options: ContainerOptions;
        bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
        unbind(serviceIdentifier: ServiceIdentifier<any>): void;
        unbindAll(): void;
        isBound(serviceIdentifier: ServiceIdentifier<any>): boolean;
        get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
        getNamed<T>(serviceIdentifier: ServiceIdentifier<T>, named: string): T;
        getTagged<T>(serviceIdentifier: ServiceIdentifier<T>, key: string, value: any): T;
        getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[];
        load(...modules: ContainerModule[]): void;
        unload(...modules: ContainerModule[]): void;
        applyMiddleware(...middleware: Middleware[]): void;
        snapshot(): void;
        restore(): void;
        createChild(): Container;
    }

    export interface Bind extends Function {
        <T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
    }

    export interface ContainerModule {
        guid: string;
        registry: (bind: Bind) => void;
    }

    export interface ContainerSnapshot {
        bindings: Lookup<Binding<any>>;
        middleware: Next;
    }

    export interface Clonable<T> {
        clone(): T;
    }

    export interface Lookup<T> extends Clonable<Lookup<T>> {
        add(serviceIdentifier: ServiceIdentifier<any>, value: T): void;
        get(serviceIdentifier: ServiceIdentifier<any>): T[];
        remove(serviceIdentifier: interfaces.ServiceIdentifier<any>): void;
        removeByCondition(condition: (item: T) => boolean): void;
        hasKey(serviceIdentifier: ServiceIdentifier<any>): boolean;
        clone(): Lookup<T>;
        traverse(func: (key: interfaces.ServiceIdentifier<any>, value: T[]) => void): void;
    }

    export interface BindingInSyntax<T> {
        inSingletonScope(): BindingWhenOnSyntax<T>;
        inTransientScope(): BindingWhenOnSyntax<T>;
    }

    export interface BindingInWhenOnSyntax<T> extends BindingInSyntax<T>, BindingWhenOnSyntax<T> { }

    export interface BindingOnSyntax<T> {
        onActivation(fn: (context: Context, injectable: T) => T): BindingWhenSyntax<T>;
    }

    export interface BindingToSyntax<T> {
        to(constructor: { new (...args: any[]): T; }): BindingInWhenOnSyntax<T>;
        toSelf(): BindingInWhenOnSyntax<T>;
        toConstantValue(value: T): BindingWhenOnSyntax<T>;
        toDynamicValue(func: (context: Context) => T): BindingInWhenOnSyntax<T>;
        toConstructor<T2>(constructor: Newable<T2>): BindingWhenOnSyntax<T>;
        toFactory<T2>(factory: FactoryCreator<T2>): BindingWhenOnSyntax<T>;
        toFunction(func: T): BindingWhenOnSyntax<T>;
        toAutoFactory<T2>(serviceIdentifier: ServiceIdentifier<T2>): BindingWhenOnSyntax<T>;
        toProvider<T2>(provider: ProviderCreator<T2>): BindingWhenOnSyntax<T>;
    }

    export interface BindingWhenOnSyntax<T> extends BindingWhenSyntax<T>, BindingOnSyntax<T> { }

    export interface BindingWhenSyntax<T> {
        when(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
        whenTargetNamed(name: string): BindingOnSyntax<T>;
        whenTargetIsDefault(): BindingOnSyntax<T>;
        whenTargetTagged(tag: string, value: any): BindingOnSyntax<T>;
        whenInjectedInto(parent: (Function | string)): BindingOnSyntax<T>;
        whenParentNamed(name: string): BindingOnSyntax<T>;
        whenParentTagged(tag: string, value: any): BindingOnSyntax<T>;
        whenAnyAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T>;
        whenNoAncestorIs(ancestor: (Function | string)): BindingOnSyntax<T>;
        whenAnyAncestorNamed(name: string): BindingOnSyntax<T>;
        whenAnyAncestorTagged(tag: string, value: any): BindingOnSyntax<T>;
        whenNoAncestorNamed(name: string): BindingOnSyntax<T>;
        whenNoAncestorTagged(tag: string, value: any): BindingOnSyntax<T>;
        whenAnyAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
        whenNoAncestorMatches(constraint: (request: Request) => boolean): BindingOnSyntax<T>;
    }

    export interface ConstraintFunction extends Function {
       (request: Request) : boolean;
        metaData?: Metadata;
    }
}

export { interfaces };
