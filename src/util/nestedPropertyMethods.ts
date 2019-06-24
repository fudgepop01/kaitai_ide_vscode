/**
 * Extracts a nested value from an object by creating and
 * executing a new anonymous function based on the parameters
 * given
 *
 * @param object the object from which to extract the value
 * @param targetPath the path to the value
 */
export function nestedGetter(object: any, targetPath: string) {
  return new Function('_', '_' + targetPath)(object);
}

/**
 * Sets an object's value from a path
 *
 * @param object the object to place the value
 * @param targetPath the path to where the value should be placed
 * @param value the value to give the key
 */
export function nestedSetter(object: any, targetPath: string, value: any) {
  return new Function('_', 'val', '_' + targetPath + '= val')(object, value);
}
