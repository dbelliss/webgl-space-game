class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        delimiter = "."
        v1_list = version1.split(delimiter)
        v2_list = version2.split(delimiter)

        if len(v1_list) != len(v2_list):
            (smaller, bigger) = (v1_list, v2_list) if len(v1_list) < len(v2_list) else (v2_list, v1_list)
            while len(smaller) != len(bigger):
                smaller.append("0")

        for i in range(0, len(v1_list)):
            v1_val = int(v1_list[i])
            v2_val = int(v2_list[i])
            if v1_val < v2_val:
                return -1
            if v1_val > v2_val:
                return 1
        return 0

if __name__=="__main__":
    s = Solution()
    assert s.compareVersion("0.1", "1.0") == -1
    assert s.compareVersion("1.1", "1.0") == 1
    assert s.compareVersion("0.1", "0.1") == 0
    assert s.compareVersion("0.1.0", "1.0") == -1
    assert s.compareVersion("7.5.3.9", "7.5.4") == -1


