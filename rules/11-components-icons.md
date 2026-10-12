# 11 — In-house Components and Icons

Do not download/copy UI components from component libraries.

If a required component is missing:
1. Search `src/shared/components`.
2. Search the feature's `presentation/components`.
3. Build the component in the correct location.
4. Add behavior tests when warranted.
5. Do not install a UI library merely to obtain the component.

Lucide React is the default icon system.

Avoid multiple icon libraries and Unicode icons where a suitable Lucide icon exists.

Icon buttons require accessible labels.
