import { FacebookFilled } from "@ant-design/icons";
import logoMetro from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="text-white">

      {/* <div className="bg-white py-8">
        <h2 className="text-[#00529b] text-center text-2xl font-semibold mb-6">
          Đối tác thương hiệu
        </h2>
        <div className="flex justify-center gap-10 flex-wrap">
          <img src={hitachiLogo} alt="Hitachi" className="h-12 object-contain" />
          <img src={masterCardLogo} alt="MasterCard" className="h-12 object-contain" />
          <img src={tokyoMetroLogo} alt="Tokyo Metro" className="h-12 object-contain" />
          <img src={fptLogo} alt="FPT" className="h-12 object-contain" />
        </div>
      </div> */}

      <div className="bg-[#00529b] px-6 p-10">
        <div className="max-w-6xl mx-auto gap-10 flex flex-row items-center text-sm">
          <div className="flex items-start gap-3">
            <img
              src={logoMetro}
              alt="HCMC Metro"
              className="w-60 bg-white rounded-xl p-8"
            />
          </div>

          <div className="text-base leading-relaxed space-y-2">
            <p>Depot Long Bình, Phường Long Bình, Thành phố Thủ Đức, TP.HCM</p>
            <p>Điện thoại: 02873003885</p>
            <p>Mã số thuế: 0315818455</p>
            <p>
              Theo Quyết định số 5368 ngày 15/11/2023 của UBND Thành phố Hồ Chí Minh
            </p>
          </div>

          <div className="leading-relaxed flex flex-col justify-between">
            <div className="mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300"
              >
                <FacebookFilled className="text-2xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
