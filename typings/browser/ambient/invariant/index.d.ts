// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/7de6c3dd94feaeb21f20054b9f30d5dabc5efabd/invariant/invariant.d.ts
// Type definitions for invariant 2.2.0
// Project: https://github.com/zertosh/invariant
// Definitions by: MichaelBennett <https://github.com/bennett000/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare let invariant:invariant.InvariantStatic;

declare module "invariant" {
  export = invariant;
}

declare namespace invariant {
  interface InvariantStatic {
    (testValue:any, format?:string, ...extra:any[]):void;
  }
}