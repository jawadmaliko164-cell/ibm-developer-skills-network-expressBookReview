namespace ColumnDesignTool.Utilities
{
    public static class UnitConverter
    {
        public static double KnToN(double kn)    => kn  * 1_000;
        public static double NToKn(double n)     => n   / 1_000;
        public static double KnmToNmm(double m)  => m   * 1_000_000;
        public static double NmmToKnm(double m)  => m   / 1_000_000;
        public static double MToMm(double m)     => m   * 1_000;
        public static double MmToM(double mm)    => mm  / 1_000;
        public static double MpaToKnm2(double v) => v   * 1_000;
        public static double Knm2ToMpa(double v) => v   / 1_000;
    }
}
