// Type definitions for jupyter-threejs
// Project: threeplot
// Definitions by: vidartf


declare module 'jupyter-threejs' {

  import { WidgetModel } from '@jupyter-widgets/base';

  export
  interface ICacheDescriptor {
    id: string;
  }

  export
  class ThreeModel extends WidgetModel {
    createPropertiesArrays(): void;
    setupListeners(): void;
    processNewObj(obj: any): any;
    createThreeObjectAsync(): Promise<any>;
    constructThreeObject(): any | Promise<any>;
    getCacheDescriptor(): ICacheDescriptor | void;
    getThreeObjectFromCache(cacheDescriptor: ICacheDescriptor): any | undefined;
    putThreeObjectIntoCache(cacheDescriptor: ICacheDescriptor, object: any): void;
    onCustomMessage(content: any, buffers: any): void;
    onExecThreeObjMethod(methodName: string, args: any[], buffer: any);
    onChange(model, options);
    onChildChanged(model, options);
    syncToThreeObj(): void;
    syncToModel(): void;
  }

  export
  class Object3D extends ThreeModel {
  }

  export
  class BlackboxModel extends Object3D {
    abstract constructThreeObject():any | Promise<any>;
  }

}
