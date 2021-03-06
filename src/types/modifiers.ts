export interface IEnhancer<T> {
	(newValue: T, oldValue: T | undefined, name: string): T;
}

export interface IModifierDescriptor<T> {
	isMobxModifierDescriptor: boolean;
	initialValue: T | undefined;
	enhancer: IEnhancer<T>;
}

export function isModifierDescriptor(thing): thing is IModifierDescriptor<any> {
	return typeof thing === "object" && thing !== null && thing.isMobxModifierDescriptor === true;
}

export function createModifierDescriptor<T>(enhancer: IEnhancer<T>, initialValue: T): IModifierDescriptor<T> {
	invariant(!isModifierDescriptor(initialValue), "Modifiers cannot be nested");
	return {
		isMobxModifierDescriptor: true,
		initialValue,
		enhancer
	};
}

export function deepEnhancer(v, _, name) {
	if (isModifierDescriptor(v))
		fail("You tried to assign a modifier wrapped value to a collection, please define modifiers when creating the collection, not when modifying it");

	// it is an observable already, done
	if (isObservable(v))
		return v;

	// something that can be converted and mutated?
	if (Array.isArray(v))
		return observable.array(v, name);
	if (isPlainObject(v))
		return observable.object(v, name);
	if (isES6Map(v))
		return observable.shallowMap(v, name);

	return v;
}

export function shallowEnhancer(v, _, name): any {
	if (isModifierDescriptor(v))
		fail("You tried to assign a modifier wrapped value to a collection, please define modifiers when creating the collection, not when modifying it");

	if (v === undefined || v === null)
		return v;
	if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v))
		return v;
	if (Array.isArray(v))
		return observable.shallowArray(v, name);
	if (isPlainObject(v))
		return observable.shallowObject(v, name);
	if (isES6Map(v))
		return observable.shallowMap(v, name);

	return fail("The shallow modifier / decorator can only used in combination with arrays, objects and maps");
}

export function referenceEnhancer(newValue?) {
	// never turn into an observable
	return newValue;
}

import { isObservable } from "../api/isobservable";
import { observable } from "../api/observable";
import { fail, isPlainObject, invariant, isES6Map } from "../utils/utils";
import { isObservableObject } from "./observableobject";
import { isObservableArray } from "./observablearray";
import { isObservableMap } from "./observablemap";
