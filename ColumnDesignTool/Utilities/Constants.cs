namespace ColumnDesignTool.Utilities
{
    public static class Constants
    {
        // Partial safety factors (ECP 203 / ACI 318)
        public const double GammaConcrete = 1.5;
        public const double GammaSteel    = 1.15;
        public const double AlphaCC       = 0.67;   // long-term concrete strength factor

        // Code limits for longitudinal steel
        public const double RhoMin = 0.008;   // 0.8%
        public const double RhoMax = 0.060;   // 6.0%

        // Default material strengths (MPa)
        public const double DefaultFcu = 30;
        public const double DefaultFy  = 400;

        // Default load factor
        public const double DefaultLoadFactor = 1.5;

        // Concrete cover (mm)
        public const double DefaultCover = 40;

        // Status colours
        public const string ColorPass    = "#4CAF50";
        public const string ColorWarning = "#FFC107";
        public const string ColorFail    = "#F44336";
    }
}
