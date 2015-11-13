/**
 * @source: https://github.com/jnetterf/satie/
 *
 * @license
 * (C) Josh Netterfield <joshua@nettek.ca> 2015.
 * Part of the Satie music engraver <https://github.com/jnetterf/satie>.
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

/**
 * @file part of Satie test suite
 */

import Chord from "../chordModel";

import {Note, Count} from "musicxml-interfaces";
import {expect} from "chai";

import IModel from "../../document/model";
import Type from "../../document/types";

import IFactory from "../../private/factory";
import IAttributesSnapshot from "../../private/attributesSnapshot";
import ICursor from "../../private/cursor";
import {fromModel as chordFromModel} from "../../private/chord";

import Factory from "../../engine/factory";

import Attributes from "../../implAttributes/attributesModel";

function getAttributes(): IAttributesSnapshot {
    return <any> {
        measureStyle: {},
        divisions: 6,
        time: {
            beats: ["4"],
            beatTypes: [4],
            senzaMisura: null
        },
        clef: {
            clefOctaveChange: null,
            sign: "G",
            line: 2
        }
    };
}

function getCursor(factory: IFactory, model: IModel): ICursor {
    let attributes = getAttributes();
    let segment = <any> [model];
    segment.part = "P1";
    return {
        fixup: null,

        segment: segment,
        idx$: 0,
        print$: null,
        header: null,

        voice: {},
        staff: {
            previous: null,
            attributes: attributes,
            totalDivisions: 12,
            accidentals$: {},
            idx: 0
        },
        measure: {
            idx: 0,
            number: "1",
            implicit: false,
            version: 0,
            nonControlling: false,
            x: 100,
            attributes: attributes,
            uuid: 1,
            parent: null
        },
        line: {
            shortestCount: 1,
            barOnLine$: 0,
            barsOnLine: 1,
            line: 0,
            lines: 1
        },

        division$: 0,
        x$: 100,
        minXBySmallest$: {},
        maxPaddingTop$: [],
        maxPaddingBottom$: [],

        page$: NaN,

        approximate: true,
        detached: false,
        factory: factory
    };
}

describe("[chord.ts]", function() {
    describe("ChordModel", function() {
        let factory = new Factory([Attributes, Chord]);
        let chord: IModel;
        it("can be created from scratch", function() {
            chord = factory.create(Type.Chord);
            expect(!!chord).to.be.true;
            expect((<any>chord).length).to.eq(0);
        });
        it("can be correctly created from a simple spec", function() {
            chord = factory.fromSpec( <Note> {
                _class: "Note",
                timeModification: {
                    actualNotes: 3,
                    normalNotes: 2
                },
                duration: 600, // Playback duration. Should be ignored in these tests.
                noteType: {
                    duration: Count.Eighth
                },
                pitch: {
                    step: "C",
                    octave: 4,
                    alter: 1
                }
            });
            let cursor$ = getCursor(factory, chord);
            chord.__validate(cursor$);

            cursor$ = getCursor(factory, chord);
            expect(cursor$.division$).to.eq(0);
            chord.__layout(cursor$);
            expect(cursor$.division$).to.eq(0, "layout must not affect cursor division");
            let xml = (<any>chord).inspect();
            expect(xml).to.contain("<step>C</step>");
            expect(xml).to.contain("<alter>1</alter>");
            expect(xml).to.contain("<octave>4</octave>");
            expect(xml).to.not.contain("<chord");
            expect(xml).to.contain("<duration>600</duration>", "Maintains playback data");
        });
        it("can be a chord generated from specs", function() {
            chord = factory.fromSpec( <Note> {
                _class: "Note",
                timeModification: {
                    actualNotes: 3,
                    normalNotes: 2
                },
                noteType: {
                    duration: Count.Eighth
                },
                pitch: {
                    step: "C",
                    octave: 4,
                    alter: 1
                }
            });
            chordFromModel(chord).push(<Note> {
                _class: "Note",
                timeModification: {
                    actualNotes: 3,
                    normalNotes: 2
                },
                noteType: {
                    duration: Count.Eighth
                },
                pitch: {
                    step: "E",
                    octave: 4
                }
            });
            let cursor$ = getCursor(factory, chord);
            chord.__validate(cursor$);
            cursor$ = getCursor(factory, chord);
            chord.__layout(cursor$);
            let chordDuration = chordFromModel(chord)[0].duration;
            expect(chordDuration).to.eq(2, "Duration wasn't specified so should be set here.");
        });
    });
});
