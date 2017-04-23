
## Dev mode


## Architecture
- try to express intent as much as possible
- minimize globals
- minimize dependencies, share code only when really necessary
- do not share code through inheritance, use mixins as much as possible
- avoid state as much as possible, embrace functional programming
- use simple dependency injection through factories for testability
  - inject only what is needed as parameter or test, no over-engineer
