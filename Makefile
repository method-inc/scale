setup:
	rm -rf node_modules
	npm cache clean
	npm install

test:
	npm install
	scripts/test

test-quick:
	scripts/test

start:
	npm start

open:
	(sleep 2 && open http://localhost:3000) &
	npm start

build:
	node_modules/.bin/mason build -f mason.json

provision-node:
	node_modules/.bin/nimbus provision -u -t prod_node1

provision-db:
	node_modules/.bin/nimbus provision -u -t prod_db1

provision-redis:
	node_modules/.bin/nimbus provision -u -t prod_redis1

deploy:
	node_modules/.bin/nimbus deploy -t prod_node1 -r master

config:
	node_modules/.bin/nimbus config -t prod_node1


.PHONY: setup test test-quick start open build deploy config