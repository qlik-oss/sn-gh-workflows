import {
  useConstraints,
  useEffect,
  useElement,
  useRect,
  useSelections,
  useStaleLayout,
  useState,
} from "@nebula.js/stardust";
import picassoQ from "picasso-plugin-q";
import picassojs from "picasso.js";

import data from "./data";
import ext from "./ext";
import properties from "./object-properties";
import definition from "./pic-definition";
import picSelections from "./pic-selections";

/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/extend/build-extension/in-qlik-sense
 */
export default function supernova(galaxy) {
  const picasso = picassojs();
  picasso.use(picassoQ);

  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const selections = useSelections();
      const layout = useStaleLayout();
      const rect = useRect();
      const constraints = useConstraints();

      const [instance, setInstance] = useState();

      useEffect(() => {
        const p = picasso.chart({
          element,
          data: [],
          settings: {},
        });

        const s = picSelections({
          selections,
          brush: p.brush("selection"),
          picassoQ,
        });

        setInstance(p);

        return () => {
          s.release();
          p.destroy();
        };
      }, []);

      useEffect(() => {
        if (!instance) {
          return;
        }
        instance.update({
          data: [
            {
              type: "q",
              key: "qHyperCube",
              data: layout.qHyperCube,
            },
          ],
          settings: definition({ layout, constraints }),
        });
      }, [layout, instance]);

      useEffect(() => {
        if (!instance) {
          return;
        }
        instance.update();
      }, [rect.width, rect.height, instance]);
    },
  };
}
