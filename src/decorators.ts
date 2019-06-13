import {commands} from 'vscode'

export function registerCommand() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    commands.registerCommand(`kaitaiStruct.${propertyKey}`, descriptor.value);
  }
}