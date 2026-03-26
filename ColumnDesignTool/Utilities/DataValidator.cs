using System;
using System.Collections.Generic;
using ColumnDesignTool.Models;

namespace ColumnDesignTool.Utilities
{
    public static class DataValidator
    {
        public static List<string> ValidateColumn(ColumnDesign col)
        {
            var errors = new List<string>();

            if (col.Fcu < 20 || col.Fcu > 100)
                errors.Add($"Fcu={col.Fcu} MPa out of valid range [20, 100].");

            if (col.Fy < 240 || col.Fy > 600)
                errors.Add($"Fy={col.Fy} MPa out of valid range [240, 600].");

            if (col.Width < 200 || col.Width > 3000)
                errors.Add($"Width={col.Width} mm out of valid range [200, 3000].");

            if (col.Depth < 200 || col.Depth > 3000)
                errors.Add($"Depth={col.Depth} mm out of valid range [200, 3000].");

            if (col.Height < 1000 || col.Height > 20000)
                errors.Add($"Height={col.Height} mm out of valid range [1000, 20000].");

            if (col.RftPercent < 0.8 || col.RftPercent > 6.0)
                errors.Add($"RFT%={col.RftPercent} out of code limits [0.8%, 6.0%].");

            if (col.LoadFactor < 1.0 || col.LoadFactor > 2.0)
                errors.Add($"Load factor={col.LoadFactor} outside reasonable range [1.0, 2.0].");

            if (col.Cover < 20 || col.Cover > 100)
                errors.Add($"Cover={col.Cover} mm outside typical range [20, 100].");

            return errors;
        }
    }
}
