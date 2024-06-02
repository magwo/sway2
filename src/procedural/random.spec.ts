import { RandomGenerator } from "./random";

describe('random', () => {

  describe('RandomGenerator', () => {

    it('should generate expected raw numbers', () => {
      const generator =  new RandomGenerator([1, 2, 3, 4]);
      expect(generator.get()).toEqual(1.6298145055770874e-9);
      expect(generator.get()).toEqual(7.916241884231567e-9);
      expect(generator.get()).toEqual(0.01318361610174179);
      expect(generator.get()).toEqual(0.043977586552500725);
      expect(generator.get()).toEqual(0.7988984857220203);
    });

    it('should generate expected floats', () => {
      const generator =  new RandomGenerator([2, 3, 4, 5]);
      expect(generator.getFloat(-10, 10)).toEqual(-9.999999953433871);
      expect(generator.getFloat(-10, 10)).toEqual(-9.99999979045242);
    });
    
    it('should generate expected integers', () => {
      const generator =  new RandomGenerator([1e4, 2e5, 3e6, 7e8]);
      expect(generator.getInteger(-10, 10)).toEqual(-7);
      expect(generator.getInteger(-10, 10)).toEqual(-7);
      expect(generator.getInteger(-10, 10)).toEqual(-6);
      expect(generator.getInteger(-10, 10)).toEqual(8);
    });

    it('should generate expected booleans', () => {
      const generator =  new RandomGenerator([2e4, 3e5, 4e6, 5e8]);
      expect(generator.getBool()).toEqual(false);
      expect(generator.getBool()).toEqual(false);
      expect(generator.getBool()).toEqual(false);
      expect(generator.getBool()).toEqual(true);
    });

    it('should generate expected integer32s', () => {
      const generator =  new RandomGenerator([3e4, 4e5, 5e6, 6e8]);
      expect(generator.getInteger32()).toEqual(600430000);
      expect(generator.getInteger32()).toEqual(645399758);
      expect(generator.getInteger32()).toEqual(277614869);
      expect(generator.getInteger32()).toEqual(2301004225);
    });

    it('should generate valid integer32s', () => {
      const generator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]);

      for(let i=0; i<10000; i++) {
        const integer32 = generator.getInteger32();
        expect(Math.round(integer32)).toEqual(integer32);
        expect(integer32).toBeGreaterThanOrEqual(0);
        expect(integer32).toBeLessThanOrEqual(4294967296);
      }
    });

    describe('getDerivedGenerator', () => {
      it('derived generator should generate expected raw numbers', () => {
        const derivedGenerator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]).getDerivedGenerator(0);
        expect(derivedGenerator.get()).toEqual(0.8418553855735809);
        expect(derivedGenerator.get()).toEqual(0.6474622760433704);
        expect(derivedGenerator.get()).toEqual(0.8741183190140873);
      });

      it('getting a derived generator should not affect parent generator', () => {
        const generator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]);
        generator.getDerivedGenerator(0);
        expect(generator.getInteger32()).toEqual(600430000);
        expect(generator.getInteger32()).toEqual(645399758);
      });

      it('derived generators with different order should not generate same random sequence as each other or parent', () => {
        const generator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]);
        const derivedGenerator1 = generator.getDerivedGenerator(0);
        const derivedGenerator2 = generator.getDerivedGenerator(1);
        
        for(let i=0; i<100; i++) {
          const n1 = generator.get();
          const n2 = derivedGenerator1.get();
          const n3 = derivedGenerator2.get();
          expect(n1).not.toEqual(n2);
          expect(n1).not.toEqual(n3);
          expect(n2).not.toEqual(n3);
        }
      });

      it('derived generators with same order should generate same random sequence', () => {
        const generator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]);
        const derivedGenerator1 = generator.getDerivedGenerator(4);
        const derivedGenerator2 = generator.getDerivedGenerator(4);
        
        for(let i=0; i<100; i++) {
          expect(derivedGenerator1.get()).toEqual(derivedGenerator2.get());
        }
      });

      it('grandchild generator of same order should not generate same random sequence as any parent', () => {
        const generator = new RandomGenerator([3e4, 4e5, 5e6, 6e8]);
        const derivedGenerator1 = generator.getDerivedGenerator(0);
        const derivedDerivedGenerator = derivedGenerator1.getDerivedGenerator(0);
        
        for(let i=0; i<100; i++) {
          const n1 = generator.get();
          const n2 = derivedGenerator1.get();
          const n3 = derivedDerivedGenerator.get();
          expect(n1).not.toEqual(n2);
          expect(n1).not.toEqual(n3);
          expect(n2).not.toEqual(n3);
        }
      });
    });
  });
});
