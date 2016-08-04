##
# (C) Josh Netterfield 2015
# Part of the Satie music engraver <https://github.com/jnetterf/satie>.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
##

.PHONY: build lint test _gentestsuite _tsc _stageOnly _testOnly test_all _bundleOnly quicktest

all: build test


# ---- Headers for generated files ------------------------------------------------

define BRAVURA_HEADER
/**
 * Licensed under the SIL Open Font License (OFL)
 * Automatically generated by 'make bravura_metadata'
 */

let Bravura =
endef
export BRAVURA_HEADER

define GLYPHNAMES_HEADER
/**
 * Licensed under the SIL Open Font License (OFL)
 */

let names: {[key: string]: string} =
endef
export GLYPHNAMES_HEADER


# ---- Standard target ------------------------------------------------------------

dist/*.js: build

build: _tsc _stageOnly _bundleOnly

NO_COLOR=\033[0m
OK_COLOR=\033[32;01m
ERROR_COLOR=\033[31;01m
WARN_COLOR=\033[33;01m
INFO_COLOR=\033[36;01m

OK_STRING=$(OK_COLOR)  ...ok!$(NO_COLOR)
TSC_STRING=$(INFO_COLOR)satie/lib» Building from tsconfig.json...$(NO_COLOR)
BUNDLE_PROD_STRING=$(INFO_COLOR)satie/lib» Bundling dist/satie-browser-prod.js...$(NO_COLOR)
WATCH_STRING=$(INFO_COLOR)satie/lib» Watching from tsconfig.json...$(NO_COLOR)
STAGE_STRING=$(INFO_COLOR)satie/lib» Updating dist/satie.d.ts...$(NO_COLOR)
LINT_STRING=$(INFO_COLOR)satie/lib» Linting src/**.ts...$(NO_COLOR)
TEST_STRING=$(INFO_COLOR)satie/lib» Testing __test__*.js ...$(NO_COLOR)
CLEAN_STRING=$(INFO_COLOR)satie/lib» Deleting generated code ...$(NO_COLOR)
COVERAGE_STRING=$(INFO_COLOR)satie/lib» Writing coverage info for __test__*.js to ./coverage ...$(NO_COLOR)
WARN_STRING=$(WARN_COLOR)[WARNINGS]$(NO_COLOR)

_tsc: _gentestsuite node_modules
	@printf "$(TSC_STRING)\n"
	@bash -c "./node_modules/.bin/tsc || (make clean; exit 1)"

_gentestsuite: clean node_modules
	@echo "// Generated by 'make _gentestsuite'" > ./src/tests.ts
	@bash -c "find ./src | grep -e \"__tests__.*\.[tj]sx\\?\$$\" | sed 's,\./src\/\(.*\)/\(.*\)\.[tj]sx*,import \"\./\1/\2\";,' | sort >> ./src/tests.ts"

_stageOnly:
	@printf "$(STAGE_STRING)\n"

# Create satie.d.ts for TypeScript clients
	@bash -c "./node_modules/.bin/dts-generator --name satie --out ./dist/satie.d.ts --main 'satie/index' --baseDir ./src ./src/index.ts > /dev/null"
	@bash -c "cd dist; find . | grep \".*\.d.ts\" | grep -v satie.d.ts | xargs -I_FILE_ rm _FILE_"

_watchStage:
	@printf "$(STAGE_STRING)\n"
# the completion message is sent before closing buffers!
	@make _stageOnly 2>&1 > /dev/null || (sleep 5; make _stageOnly)

_bundleOnly: _stageOnly lint
	@printf "$(BUNDLE_PROD_STRING)\n"
	@bash -c "./node_modules/.bin/webpack --config ./webpack.config.prod.js -p ./dist/index.js ./dist/satie-bundled-min.js"

# ---- Other build modes ----------------------------------------------------------

watch: ./node_modules ./webapp/node_modules
	@make _gentestsuite
	@printf "$(WATCH_STRING)\n"
	@bash -c "rm -rf ./dist"
	@bash -c "trap 'trap - TERM; kill 0' INT TERM EXIT; \
	./bin/watch.sh"

smufl:
	@bash -c "echo -ne \"$$BRAVURA_HEADER\"" > ./src/models/smufl/bravura.ts
	@bash -c "cat ./vendor/bravura/bravura_metadata.json | jq '{fontName: .fontName, fontVersion: .fontVersion, engravingDefaults: .engravingDefaults, glyphBBoxes: [(.glyphBBoxes | to_entries[] | .value.bBoxNE + .value.bBoxSW + [.key])], glyphsWithAnchors: .glyphsWithAnchors, ligatures: .ligatures}' >> ./src/models/smufl/bravura.ts"
	@bash -c "echo '; export default Bravura;' >> ./src/models/smufl/bravura.ts"
	
	@bash -c "echo -ne \"$$GLYPHNAMES_HEADER\" > ./src/models/smufl/glyphnames.ts"
	@cat ./vendor/smufl/glyphnames.json | jq '[to_entries[] | {key: .key, value: .value.codepoint}] | from_entries' >> ./src/models/smufl/glyphnames.ts
	@bash -c "echo '; export default names;' >> ./src/models/smufl/glyphnames.ts"
	@printf "$(INFO_COLOR)» SMuFL built successfully.$(NO_COLOR)\n"; \

TS_FILES = $(shell bash -c "find src/ -type f -name '*.ts'")

lint: node_modules/.bin/tslint
	@printf "$(LINT_STRING)\n"
	@bash -c "set -o pipefail; ./node_modules/.bin/tslint $(TS_FILES) | sed -e \"s/\(.*\)/[tslint] \x1b[31;01m\1\x1b[0m/\""

vendor/tslint/bin/tslint.js:
	@git submodule update --init --recursive
	@cd ./vendor/tslint/; NODE_ENV=dev npm install
	@cd ./vendor/tslint/; grunt

test: build
	@make _testOnly
	@make lint

quicktest: _tsc
	@make _testOnly

_testOnly:
	@printf "$(TEST_STRING)\n"
	@bash -c "if [ \"x\$$TEST\" == \"x\" ]; then find ./dist -type f | grep \"__tests__.*js\\$$\" | xargs ./node_modules/mocha/bin/mocha -t 3000; else find ./dist -type f | grep \"__tests__.*js\\$$\" | xargs ./node_modules/mocha/bin/mocha -t 3000 --grep \"\$$TEST\" 2>&1; fi"

test_all: test lint

coverage: build
	@printf "$(COVERAGE_STRING)\n"
	@bash -c "find ./dist -type f | grep "__tests__.*js\$$" | xargs istanbul cover node_modules/mocha/bin/_mocha -- -R list"

./webapp/node_modules: webapp/package.json
	@printf "$(WARN_COLOR)Regenerating satie/webapp/node_modules...$(NO_COLOR)\n";
	@cd ./webapp; npm prune; npm install --cache-min 1000000;

./node_modules: package.json
	@printf "$(WARN_COLOR)Regenerating satie/node_modules...$(NO_COLOR)\n";
	@npm prune
	@npm install --cache-min 1000000

clean:
	@printf "$(CLEAN_STRING)\n"
	@rm -rf ./dist
