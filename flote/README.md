# flotE
The current method for tracking finishing times in a boat race presents two problems: (1) two people are required for timekeeping, one for keeping time and the other for recording results; and (2) the finish line is not clearly visible from shore, resulting in a delay between when a boat finishes and when viewers receive its finishing time. Our clients proposed flotE to solve these problems. The application has two main features: administration and timekeeping. flotE helps users organize and save regattas, races, and participants, in addition to providing a way to search these stored records. The application also provides timekeeping capabilities: a built-in stopwatch and boat ID suggestions as the user types allow a single user to timekeep a race on their own; additionally, as results are recorded, they are posted to the application in real time (via SMS) for viewers to see.

## Building the application
```
npm run dev
```

## Project structure
```sh
src
|
+-- app               # application layer containing:
|   |                 # this folder might differ based on the meta framework used
|   +-- routes        # application routes / can also be pages
|   +-- app.tsx       # main application component
|   +-- provider.tsx  # application provider that wraps the entire application with different global providers - this might also differ based on meta framework used
|   +-- router.tsx    # application router configuration
+-- assets            # assets folder can contain all the static files such as images, fonts, etc.
|
+-- components        # shared components used across the entire application
|
+-- config            # global configurations, exported env variables etc.
|
+-- features          # feature based modules
|
+-- hooks             # shared hooks used across the entire application
|
+-- lib               # reusable libraries preconfigured for the application
|
+-- stores            # global state stores
|
+-- test              # test utilities and mocks
|
+-- types             # shared types used across the application
|
+-- utils             # shared utility functions
```
[Source: Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)

## Authors (Group 1)
- [Ashley Bhandari](https://github.com/ashleybhandari)
- [Jamie Denley](https://github.com/Jamie11111)
- [Macy Graves](https://github.com/megraves)
- [Austin Henlotter](https://github.com/AustinHen)
- [Dila Ozersen](https://github.com/DilaOzersen)
- Anushka Trehan (Manager)