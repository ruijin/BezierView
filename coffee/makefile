
PREF=bvPatch eval ObjectControls render crv highlight read test querystring
TARGETS=$(addprefix ../js/, $(addsuffix .js, $(PREF)))

.PHONY: all clean orig test
all: $(TARGETS)

../js/%.js: %.coffee
	coffee -c -b -o ../js/ $<
	chmod 644 $@

clean:
	-rm $(TARGETS)

orig:
	cp ../js_orig/*.js ../js
	chmod 644 ../js/*.js

# all checked files go here
test: orig
	-rm ../js/highlight.js      ; make ../js/highlight.js
	-rm ../js/querystring.js    ; make ../js/querystring.js
	-rm ../js/crv.js            ; make ../js/crv.js
	-rm ../js/read.js           ; make ../js/read.js
	-rm ../js/test.js           ; make ../js/test.js
	-rm ../js/ObjectControls.js ; make ../js/ObjectControls.js
	-rm ../js/eval.js           ; make ../js/eval.js
	-rm ../js/render.js         ; make ../js/render.js
	-rm ../js/bvPatch.js        ; make ../js/bvPatch.js
