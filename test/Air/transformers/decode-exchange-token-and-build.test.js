import { expect } from 'chai';
import { AirRuntimeError }  from '../../../src/Services/Air/AirErrors';
import convert from '../../../src/Services/Air/transformers/decode-exchange-token-and-build';

const token = 'eJztWFtz2jgU/isezz61BHzhEpjpg7Bl8OILNSJd2sl0HFuAG8eitiGQTv77SsYGc8tmsu3Ozs7mhejoSDr6zqdzPvjBu0HcAUEM197cjWa4u4z8EPOdLz94jzw8kOjrSm5+FcouejQlmcNvfOcHX1jBA1lGKd/hlc8Dga/wSmbVMN6axOt2g1qB7yskDLGXBiTaOzt4Ss8txs+Vw7OHbuAjd70/s3yWdN1mpxE/O+h3/vm5csZLrot7L8e64FVv1/demnNpL3nvpH++6CTtvT7+Qb1un28rBdrDOPCCaMaQpFffX2yAN9R9MpQbje9dAECtC8N1fTWk/4IPH85vMiLhcovm5V2M8i4VHpHUDdnyPDmSKIktau+6CS7McOy06lJVYOmB35fByg1xlJY9SgtpdnBSSl8e4QjPHjBD5DCyBmonRWTh+h7e/76LrBeT5YK6ZAxy4zjAMR0NjGx4F0RK6CbsIOiRiDxsqFkLg9k8tZYPd5mrKEksPXYczAJGMGCO6FDFSRpEbkE6tZfZFm6cLmOMggd2HUkQW1eidCUKSGh2Go2OINDbC+8FsZOBAGg0FIQz3tcd8cQ7C9SejnC82qI1YVEtWARumFsTPfIDz00JC3zqhgkusGO8SeZufPTW7AWO6SWi2RE0O/s5MBhpKgf4f1rFYoH/9dMEz0/xl/4G/vUy/gXWZfyLnJzHX5KR0O6Iwuvwp97UVT7x/rfgX7/88l/97H/1g63weVQmTueEleHe0o3dKMXYZxmmOChu6C3DLIF6Vqh7BVTaCUqnt9EOb8OW0LgCFsDk08BiEA5pujBtGDHaLHBeNoGKXveU4XTKOsoKq266I4cgX0kikuSOIHcaQlUSWu8FIadSUaitsSK3m9Vmkxotkt64YeB38ZTEh0+8NAumaZba0uRxu4KRT+IEH1Y+unjJNrVsy4FajX5AS7XZ5xUdjy0VdA3IZenhxqB/5tWWAe3/FEAvv83XACrX3wpoVqEvAcoq1q8CNH+GXULuT95gbsyRmrxQ8HLCZ437JZrn3W/rd7Hn7eXDT4ig/0IEF6v+c4FL8dApKIwqHOUCNzC4IXC4bVLpgNm2A5rqVluuyhLFnXNsWG3LDem6RVfw+X4HFNwjXSLj7uiuO5u5VESGIXl0I4/VJup+buYwayh2VzgsTnh9xTgo4HklGzvGbvN8zJAwJ8jRh8BSTduBVcU2a13Q64EeVCECujEaGFVm4Hf0QnidHmzEDGynfB2n6iPFHltoxJlgwoHh0JhwXTCCKmdbnObAj2NoIU4zJtDhRgig8ahGZwzdgpzSh8pAt2qa7ZicrdHcTEzqXDN1Q0fAmdQgUqp8VjrKJ4+HyG4IRrcmyYMeR+/CMUtTMvSa2Lg2FPNtS/bJU3HqBmFSkuiLRUh7611IC9OM0VdMUmWOvfuspRz0M9a4WPMuK+nj1VLk//XqfcV8mRaX697/tPhP0iIPiGV3Y0cXSskbq8bFtDJcRKkEUr3BQBIbByDlMZ0Adaz4Dvn9Rir/o7He7oHP5eXJQoM8sp6TT+9EeKWY0Mj2V4HCPMRUvKebjAaZfE3jJbOrQeIxAbKfKFboFBeqzeNNXgl0KmrjLVJuSOczCZJJ9xvMVEbemzJVr5EYBZRbbJbe+lgJsTDdJGV2RLaOx6Ixv1h+dtbIWZPP2KqQaIXjhAbi5Du3qkKzJTPlxCz2tPhlhX0dzpvrroqx70HsRGUZxzjymD7MRE7+PcNfBQmJNyZOEpdt8IV/xw0dXdGtHueMDTjiboChqwAxgwIcR6c1Jbv0O04DDswqkNIHFi1LY4v6jzikKwOIaDF6V7T3kiwrePRaMZZz40Dl9UmSIgoO+yGD79cTHRR/2uopJD1xbsJHUe0Ds10XH9NIFbyab/mtO8s3LMlSPwueaq1N1Xm0nuDGQo7kyTdP5jdH8L9pjybSNr4B+6B73/BGaxvk4uf2+U/y/bow';

describe('Air.transformers.decodeExchangeToken', () => {
  it('should not pass and add xml', () => {
    const params = { exchangeToken: token };
    return convert(params).then(rsp => {
      expect(params.xml).to.be.an('object');
      expect(params.xml).to.have.all.keys([
        'air:AirExchangeBundle_XML',
        'air:AirPricingSolution_XML',
        'common_v36_0:HostToken_XML',
      ]);
    });
  });

  it('should throw correct error', () => {
    const params = { exchangeToken: 123 };
    return convert(params).then(rsp => {
      throw new Error('Cant be success');
    }).catch(e => {
      expect(e).to.be.instanceof(AirRuntimeError.ExchangeTokenIncorrect);
    });
  });
});

