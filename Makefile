CONTAINER_NAME ?= next

shell:
	@docker exec -it $(CONTAINER_NAME) \
	sh -c "/bin/bash || /bin/sh"
