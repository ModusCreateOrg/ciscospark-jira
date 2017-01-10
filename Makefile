INENV=bash inenv.sh
NPMRUN=npm run

all: clean lint test transpile

clean:
	rm -f lib/*

transpile: $(wildcard src/**/*)
	$(NPMRUN) transpile

lint:
	$(INENV) $(NPMRUN) lint

fix:
	$(INENV) $(NPMRUN) fix

test:
	$(INENV) $(NPMRUN) test

watch:
	$(INENV) $(NPMRUN) watch

start:
	$(INENV) $(NPMRUN) start

install:
	# nothing to see here

.PHONY: \
	lint fix test watch transpile
