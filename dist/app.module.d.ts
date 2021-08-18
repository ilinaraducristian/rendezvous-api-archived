import { DynamicModule, Provider } from '@nestjs/common';
export declare class AppModule {
    static envVariables: any;
    static asyncImports(): DynamicModule[];
    static typeORM(): DynamicModule[];
    static mediasoupProvider(): Provider;
}
