# Contributing
- Read the [style guide](https://github.com/mandarineorg/mandarinets/blob/master/docs/style_guide.md)
- Ask for help in the [community chat room](https://discord.gg/yq4Hz5e)
- If you are going to work on an issue:
    - Comment the issue & understand what the issue is about
    - Make sure no one else is working on it already
    - Assign it to you
    - Investigate everything you have to investigate
    
### Self-dependency
We want to be as self-dependent as we can, this means, the less external modules or third-party codes we have, the better.

# Branch
  - When starting to work on an issue, you **must always** branch off of `develop`
# Submitting a pull request
 - Under any sceneario, you **must always** pull-request to the `develop` branch. If this is not the case, your PR will either be edited or rejected.
## Steps
Before submitting, please make sure the following is done:
1) You have branched off of `develop` for your current issue & PR
2) That there is a related issue and it is referenced in the PR text
3) There are tests that cover the changes
4) Github CI is passing
5) Your code is documented with **JSDoc**

# External modules
If your code requires a third-party module **or** a module from `deno/std`, you will need to add this module to the following repository: [`mandarinets-modules`](https://github.com/mandarineorg/mandarinets-modules).  
It is likely you will need help from @andreespirela.
