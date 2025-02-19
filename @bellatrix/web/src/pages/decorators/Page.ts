import { getSingletonInstance } from '@bellatrix/core/utilities';
import { WebPageAsserts, WebPageMap, WebPage } from '..';

import type { ParameterlessCtor } from '@bellatrix/core/types';

export function Page<TMap extends WebPageMap | null, TAsserts extends WebPageAsserts<TMap extends null ? never : TMap> | null>(map: ParameterlessCtor<TMap> | null, asserts: ParameterlessCtor<TAsserts> | null) {
    return function <TPage extends WebPage<typeof map extends null ? null : TMap, typeof asserts extends null ? null : TAsserts>>(target: ParameterlessCtor<TPage>) {
        if (map) {
            Object.defineProperty(target.prototype, 'map', {
                get: function () {
                    return getSingletonInstance(map as ParameterlessCtor<object>);
                }
            });
        }

        if (asserts) {
            Object.defineProperty(target.prototype, 'asserts', {
                get: function () {
                    return getSingletonInstance(asserts as ParameterlessCtor<object>);
                }
            });

            if (map) {
                Object.defineProperty(asserts.prototype, 'map', {
                    get: function () {
                        return getSingletonInstance(map as ParameterlessCtor<object>);
                    }
                });
            }
        }
    };
}
