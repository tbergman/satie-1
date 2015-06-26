/** 
 * (C) Josh Netterfield <joshua@nettek.ca> 2015.
 * Part of the Satie music engraver <https://github.com/ripieno/satie>.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import _ = require("lodash");
import invariant = require("react/lib/invariant");

import {IModel, IMeasureLayout, ILayoutOptions, ILineBounds} from "../engine";

/** 
 * Centers elements marked as such
 * 
 * @returns new end of line
 */
function center(options: ILayoutOptions, bounds: ILineBounds,
        measures$: IMeasureLayout[]): IMeasureLayout[] {

    _.forEach(measures$, function(measure, measureIdx) {
        let maxIdx = _.max(_.map(measure.elements, el => el.length));
        _.times(maxIdx, function(j) {
            for (let i = 0; i < measure.elements.length; ++i) {
                if (measure.elements[i][j].expandPolicy === IModel.ExpandPolicy.Centered) {
                    let intrinsicWidth = measure.elements[i][j].renderedWidth;
                    let originX = measure.elements[i][j].x$;
                    invariant(isFinite(intrinsicWidth),
                        "Intrinsic width must be set on centered items");
                    let measureSpaceRemaining = _.last(measure.elements[i]).overrideX -
                        (measures$[measureIdx - 1].width - _.last(measures$[measureIdx - 1].elements[i]).overrideX);
                    measure.elements[i][j].x$ += measureSpaceRemaining/2 - intrinsicWidth/2;
                }
            }
        });
    });

    return measures$;
}

export default center;

